# Natural Restore

A mobile-first, same-resolution photo restoration app focused on realism rather than artificial upscaling.

## Core rules

- Input and output pixel dimensions stay identical.
- No 2x/4x upscale in the default pipeline.
- No generative face replacement.
- AI restoration is blended with the original to protect identity, pores, hair, jewellery, fabric and natural grain.
- JPEG export defaults to quality 97 and preserves ICC profile + EXIF where possible.
- PNG stays PNG.

## Open-source restoration

The optional Ultra engine uses **SwinIR** (Apache-2.0) in its color-denoising configuration with scale=1. The Docker image clones the official SwinIR repository and downloads the official color denoising noise-15 checkpoint. The checkpoint is intentionally used as a subtle restoration stage and blended back with the original.

CodeFormer is intentionally not bundled because its default license restricts commercial use. GFPGAN is also not bundled because some included/derived components have additional non-commercial restrictions.

## Run frontend

```bash
npm install
npm run dev
```

By default the UI calls `http://localhost:8000`. For a deployed backend:

```bash
VITE_API_URL=https://your-api.example.com npm run build
```

## Run restoration API

### Fast fallback mode

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

This runs a conservative OpenCV restoration pipeline and keeps the exact resolution.

### SwinIR Ultra mode

The included Dockerfile installs the Apache-2.0 SwinIR source and official same-resolution color-denoising model:

```bash
docker compose up --build
```

The backend automatically uses SwinIR when `SWINIR_HOME` and `SWINIR_MODEL_PATH` are available. If the AI model cannot load, the app falls back safely to the non-generative same-resolution pipeline.

## API

`POST /enhance`

Multipart fields:

- `file`: JPEG or PNG
- `mode`: `natural` or `ultra`
- `strength`: 0-100

Response is the enhanced image with the same displayed pixel dimensions as the input.

## Commercial-use note

This repo contains original application code plus permissively licensed dependencies. Third-party notices are in `THIRD_PARTY_NOTICES.md`. Always re-check model/checkpoint terms before public commercial release if you swap or add models.
