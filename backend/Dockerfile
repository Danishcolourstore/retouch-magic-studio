FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    SWINIR_HOME=/opt/swinir \
    SWINIR_MODEL_PATH=/opt/models/005_colorDN_DFWB_s128w8_SwinIR-M_noise15.pth

RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir timm==1.0.12

RUN git clone --depth 1 https://github.com/JingyunLiang/SwinIR.git /opt/swinir && \
    mkdir -p /opt/models && \
    curl -L --fail --retry 3 \
      https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/005_colorDN_DFWB_s128w8_SwinIR-M_noise15.pth \
      -o /opt/models/005_colorDN_DFWB_s128w8_SwinIR-M_noise15.pth

COPY backend /app

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
