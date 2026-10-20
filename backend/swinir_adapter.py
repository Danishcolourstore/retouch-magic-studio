from __future__ import annotations

import os
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np


class SwinIRRestorer:
    def __init__(self, home: str, model_path: str):
        import torch

        home_path = Path(home)
        weights = Path(model_path)
        if not home_path.exists() or not weights.exists():
            raise FileNotFoundError("SwinIR source or model weights are missing")

        if str(home_path) not in sys.path:
            sys.path.insert(0, str(home_path))

        from models.network_swinir import SwinIR  # type: ignore

        self.torch = torch
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = SwinIR(
            upscale=1,
            in_chans=3,
            img_size=128,
            window_size=8,
            img_range=1.0,
            depths=[6, 6, 6, 6, 6, 6],
            embed_dim=180,
            num_heads=[6, 6, 6, 6, 6, 6],
            mlp_ratio=2,
            upsampler="",
            resi_connection="1conv",
        )

        checkpoint = torch.load(str(weights), map_location="cpu")
        state = checkpoint["params"] if isinstance(checkpoint, dict) and "params" in checkpoint else checkpoint
        self.model.load_state_dict(state, strict=True)
        self.model.eval().to(self.device)

    def restore(self, rgb: np.ndarray) -> np.ndarray:
        torch = self.torch
        x = torch.from_numpy(rgb.astype(np.float32) / 255.0)
        x = x.permute(2, 0, 1).unsqueeze(0).to(self.device)

        h, w = x.shape[-2:]
        window = 8
        h_pad = (window - h % window) % window
        w_pad = (window - w % window) % window

        if h_pad:
            x = torch.cat([x, torch.flip(x, [2])], dim=2)[:, :, : h + h_pad, :]
        if w_pad:
            x = torch.cat([x, torch.flip(x, [3])], dim=3)[:, :, :, : w + w_pad]

        with torch.inference_mode():
            y = self.model(x)

        y = y[..., :h, :w]
        y = y.squeeze(0).clamp(0, 1).permute(1, 2, 0).cpu().numpy()
        return np.rint(y * 255.0).astype(np.uint8)


@lru_cache(maxsize=1)
def get_swinir():
    home = os.environ.get("SWINIR_HOME")
    model_path = os.environ.get("SWINIR_MODEL_PATH")
    if not home or not model_path:
        return None

    try:
        return SwinIRRestorer(home, model_path)
    except Exception as exc:
        print(f"SwinIR unavailable; using conservative fallback: {exc}")
        return None
