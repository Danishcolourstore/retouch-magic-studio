from typing import Literal
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from enhance import restore_image

app = FastAPI(title="Natural Restore API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Output-Filename", "X-Image-Width", "X-Image-Height", "X-Restoration-Engine"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/enhance")
async def enhance(
    file: UploadFile = File(...),
    mode: Literal["natural", "ultra"] = Form("ultra"),
    strength: int = Form(68),
):
    if file.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(status_code=415, detail="Only JPEG and PNG are supported.")

    strength = max(0, min(100, int(strength)))
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty image file.")
    if len(raw) > 40 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image is larger than 40 MB.")

    try:
        result = restore_image(raw, file.filename or "image.jpg", mode, strength)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Restoration failed: {exc}") from exc

    return Response(
        content=result.data,
        media_type=result.media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{result.filename}"',
            "X-Output-Filename": result.filename,
            "X-Image-Width": str(result.width),
            "X-Image-Height": str(result.height),
            "X-Restoration-Engine": result.engine,
            "Cache-Control": "no-store",
        },
    )
