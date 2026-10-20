from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

from swinir_adapter import get_swinir


@dataclass
class RestoreResult:
    data: bytes
    media_type: str
    filename: str
    width: int
    height: int
    engine: str


def _safe_exif(img: Image.Image):
    try:
        exif = img.getexif()
        if exif:
            exif[274] = 1  # orientation already applied by exif_transpose
            return exif.tobytes()
    except Exception:
        return None
    return None


def _micro_restore(rgb: np.ndarray, mode: str, strength: int) -> np.ndarray:
    """Conservative, non-generative fallback. Never changes dimensions."""
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    s = strength / 100.0

    if mode == "natural":
        denoised = cv2.bilateralFilter(bgr, d=5, sigmaColor=8 + 10 * s, sigmaSpace=8 + 10 * s)
        amount = 0.08 + 0.10 * s
        blend = 0.20 + 0.22 * s
    else:
        h = 1.4 + 2.4 * s
        denoised = cv2.fastNlMeansDenoisingColored(bgr, None, h, h, 7, 21)
        amount = 0.12 + 0.18 * s
        blend = 0.30 + 0.28 * s

    blur = cv2.GaussianBlur(denoised, (0, 0), sigmaX=1.05)
    sharpened = cv2.addWeighted(denoised, 1.0 + amount, blur, -amount, 0)
    restored = cv2.addWeighted(sharpened, blend, bgr, 1.0 - blend, 0)
    restored = np.clip(restored, 0, 255).astype(np.uint8)
    return cv2.cvtColor(restored, cv2.COLOR_BGR2RGB)


def _ai_restore(rgb: np.ndarray, strength: int) -> tuple[np.ndarray, str]:
    model = get_swinir()
    if model is None:
        return _micro_restore(rgb, "ultra", strength), "opencv-fallback"

    ai = model.restore(rgb)
    if ai.shape[:2] != rgb.shape[:2]:
        ai = cv2.resize(ai, (rgb.shape[1], rgb.shape[0]), interpolation=cv2.INTER_AREA)

    # SwinIR denoising can be too clean on already-good photos. Blend it back with
    # the original instead of replacing the image. This protects texture and identity.
    s = strength / 100.0
    ai_weight = 0.32 + 0.42 * s
    original_weight = 1.0 - ai_weight
    mixed = cv2.addWeighted(ai, ai_weight, rgb, original_weight, 0)

    # Tiny luminance-detail recovery after denoising; deliberately restrained.
    bgr = cv2.cvtColor(mixed, cv2.COLOR_RGB2BGR)
    blur = cv2.GaussianBlur(bgr, (0, 0), sigmaX=0.9)
    detail = 0.05 + 0.10 * s
    crisp = cv2.addWeighted(bgr, 1.0 + detail, blur, -detail, 0)
    return cv2.cvtColor(np.clip(crisp, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB), "swinir-color-dn15"


def restore_image(raw: bytes, filename: str, mode: str, strength: int) -> RestoreResult:
    try:
        source = Image.open(BytesIO(raw))
    except Exception as exc:
        raise ValueError("Could not decode this image.") from exc

    original_format = (source.format or "JPEG").upper()
    icc = source.info.get("icc_profile")
    exif = _safe_exif(source)

    # Apply camera orientation once, then work in visible pixel space.
    source = ImageOps.exif_transpose(source).convert("RGB")
    rgb = np.asarray(source, dtype=np.uint8)
    height, width = rgb.shape[:2]

    if strength <= 0:
        restored = rgb
        engine = "original"
    elif mode == "ultra":
        restored, engine = _ai_restore(rgb, strength)
    else:
        restored = _micro_restore(rgb, "natural", strength)
        engine = "opencv-natural"

    if restored.shape[:2] != (height, width):
        restored = cv2.resize(restored, (width, height), interpolation=cv2.INTER_AREA)

    output = Image.fromarray(restored, mode="RGB")
    buf = BytesIO()
    stem = Path(filename).stem or "image"

    if original_format == "PNG" or filename.lower().endswith(".png"):
        save_kwargs = {"format": "PNG", "compress_level": 2}
        if icc:
            save_kwargs["icc_profile"] = icc
        if exif:
            save_kwargs["exif"] = exif
        output.save(buf, **save_kwargs)
        out_name = f"{stem}-restored.png"
        media_type = "image/png"
    else:
        save_kwargs = {
            "format": "JPEG",
            "quality": 97,
            "subsampling": 0,
            "optimize": True,
        }
        if icc:
            save_kwargs["icc_profile"] = icc
        if exif:
            save_kwargs["exif"] = exif
        output.save(buf, **save_kwargs)
        out_name = f"{stem}-restored.jpg"
        media_type = "image/jpeg"

    return RestoreResult(
        data=buf.getvalue(),
        media_type=media_type,
        filename=out_name,
        width=width,
        height=height,
        engine=engine,
    )
