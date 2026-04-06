import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { processPixels, getOriginalPixels } from "@/lib/imageProcessor";
import type { RetouchValues } from "@/types";
import type { FaceRegion } from "@/lib/mediapipe";

interface ImagePreviewProps {
  imageUrl: string;
  width: number;
  height: number;
  values: RetouchValues;
  faceRegions: FaceRegion[];
  faceRetouchEnabled: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  width,
  height,
  values,
  faceRegions,
  faceRetouchEnabled,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<{ imageData: ImageData; width: number; height: number } | null>(null);
  const rafRef = useRef<number>(0);

  const handlePointerDown = useCallback(() => setShowOriginal(true), []);
  const handlePointerUp = useCallback(() => setShowOriginal(false), []);

  // Load original pixel data when image changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      originalRef.current = getOriginalPixels(img);
      // Trigger initial render
      renderCanvas(values, false);
    };
    img.src = imageUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  const renderCanvas = useCallback((vals: RetouchValues, original: boolean) => {
    const orig = originalRef.current;
    const canvas = canvasRef.current;
    if (!orig || !canvas) return;

    canvas.width = orig.width;
    canvas.height = orig.height;
    const ctx = canvas.getContext("2d")!;

    if (original) {
      ctx.putImageData(orig.imageData, 0, 0);
      return;
    }

    const dst = ctx.createImageData(orig.width, orig.height);
    processPixels(orig.imageData, dst, vals);
    ctx.putImageData(dst, 0, 0);

    // Apply skin smooth as CSS blur on the face region overlay if needed
    // (keeping face-aware blur as CSS for performance)
  }, []);

  // Re-render when values or showOriginal changes
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      renderCanvas(values, showOriginal);
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [values, showOriginal, renderCanvas]);

  // Face blur via CSS on a duplicate canvas — only for skin smooth
  const useFaceMode =
    faceRetouchEnabled &&
    faceRegions.length > 0 &&
    values.skinSmooth > 0 &&
    !showOriginal;

  const blurAmount = (values.skinSmooth / 100) * 1.5;

  const clipPath = useMemo(() => {
    if (!useFaceMode) return "none";
    const paths = faceRegions.map((r) => {
      const cx = (r.x + r.width / 2) * 100;
      const cy = (r.y + r.height / 2) * 100;
      const rx = (r.width / 2) * 100;
      const ry = (r.height / 2) * 100;
      return `ellipse(${rx}% ${ry}% at ${cx}% ${cy}%)`;
    });
    return paths.length === 1 ? paths[0] : paths[0]; // single face simplification
  }, [useFaceMode, faceRegions]);

  return (
    <div
      className="relative flex items-center justify-center h-full w-full overflow-hidden select-none bg-background"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        id="retouch-preview"
        className="max-w-full max-h-full object-contain"
        style={{ imageRendering: "auto" }}
      />

      {/* Face blur overlay — CSS blur clipped to face region */}
      {useFaceMode && (
        <canvas
          ref={(el) => {
            // Mirror main canvas content to overlay for blur
            if (el && canvasRef.current) {
              const main = canvasRef.current;
              el.width = main.width;
              el.height = main.height;
              const ctx = el.getContext("2d");
              if (ctx) ctx.drawImage(main, 0, 0);
            }
          }}
          className="absolute max-w-full max-h-full object-contain pointer-events-none"
          style={{
            filter: `blur(${blurAmount}px)`,
            clipPath,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      <Badge
        variant="secondary"
        className="absolute bottom-3 left-3 text-xs font-mono bg-background/70 text-muted-foreground border-border backdrop-blur-sm"
      >
        {width} × {height}
      </Badge>
      {showOriginal && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur-sm text-muted-foreground text-xs font-medium px-3 py-1 rounded-full">
          Original
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
