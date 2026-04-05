import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

export interface FaceRegion {
  /** Bounding box as percentages (0-1) of image dimensions */
  x: number;
  y: number;
  width: number;
  height: number;
}

let detector: FaceDetector | null = null;
let initPromise: Promise<FaceDetector> | null = null;

async function getDetector(): Promise<FaceDetector> {
  if (detector) return detector;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    detector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.5,
    });
    return detector;
  })();

  return initPromise;
}

/**
 * Detect faces in an image element and return face regions as
 * percentage-based bounding boxes (relative to image natural size).
 */
export async function detectFaces(
  imageElement: HTMLImageElement
): Promise<FaceRegion[]> {
  try {
    const det = await getDetector();
    const result = det.detect(imageElement);

    return result.detections.map((d) => {
      const bb = d.boundingBox!;
      const natW = imageElement.naturalWidth;
      const natH = imageElement.naturalHeight;
      return {
        x: bb.originX / natW,
        y: bb.originY / natH,
        width: bb.width / natW,
        height: bb.height / natH,
      };
    });
  } catch (err) {
    console.error("Face detection failed:", err);
    return [];
  }
}

/**
 * Build a CSS clip-path ellipse() string that covers the detected face
 * with some padding for a natural look.
 */
export function buildFaceClipPath(face: FaceRegion, padding = 0.35): string {
  const cx = (face.x + face.width / 2) * 100;
  const cy = (face.y + face.height / 2) * 100;
  const rx = (face.width / 2) * (1 + padding) * 100;
  const ry = (face.height / 2) * (1 + padding) * 100;
  return `ellipse(${rx}% ${ry}% at ${cx}% ${cy}%)`;
}

/**
 * Build a combined clip-path for multiple faces.
 * Since CSS clip-path doesn't support multiple ellipses natively,
 * we use a polygon approximation that covers all face areas.
 * For single face, returns an ellipse.
 */
export function buildMultiFaceClipPath(
  faces: FaceRegion[],
  padding = 0.35
): string {
  if (faces.length === 0) return "none";
  if (faces.length === 1) return buildFaceClipPath(faces[0], padding);
  // For multiple faces, create a union by using the largest bounding area
  // This is a pragmatic simplification - covers all faces in one region
  const minX = Math.min(...faces.map((f) => f.x - f.width * padding));
  const minY = Math.min(...faces.map((f) => f.y - f.height * padding));
  const maxX = Math.max(
    ...faces.map((f) => f.x + f.width * (1 + padding))
  );
  const maxY = Math.max(
    ...faces.map((f) => f.y + f.height * (1 + padding))
  );
  const cx = ((minX + maxX) / 2) * 100;
  const cy = ((minY + maxY) / 2) * 100;
  const rx = ((maxX - minX) / 2) * 100;
  const ry = ((maxY - minY) / 2) * 100;
  return `ellipse(${rx}% ${ry}% at ${cx}% ${cy}%)`;
}
