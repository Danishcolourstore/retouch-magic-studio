# Third-Party Notices

This application uses or can use the following open-source projects.

## SwinIR

Repository: `JingyunLiang/SwinIR`
License: Apache License 2.0
Purpose: optional same-resolution color image restoration / denoising in Ultra mode.

The Docker image clones the official SwinIR repository and downloads the official `005_colorDN_DFWB_s128w8_SwinIR-M_noise15.pth` checkpoint from the project's GitHub release assets.

## OpenCV

License: Apache License 2.0
Purpose: conservative fallback denoising, blending and detail recovery.

## React

License: MIT
Purpose: application UI.

## Vite

License: MIT
Purpose: frontend development and build tooling.

## FastAPI

License: MIT
Purpose: restoration HTTP API.

## Pillow

License: HPND
Purpose: image decode/encode and metadata handling.

## PyTorch

License: BSD-style
Purpose: SwinIR inference runtime in the AI Docker image.

This notice is informational and does not replace the upstream license texts. Upstream license files remain available in their respective projects and, for SwinIR, inside the cloned `/opt/swinir` directory in the built container.
