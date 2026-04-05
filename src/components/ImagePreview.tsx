import React, { useState, useCallback, useMemo } from "react";
import { buildFilterString, buildBlurFilterString } from "@/utils/filters";
import { buildMultiFaceClipPath, type FaceRegion } from "@/lib/mediapipe";
import { Badge } from "@/components/ui/badge";
import type { RetouchValues } from "@/types";

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

  const handlePointerDown = useCallback(() => setShowOriginal(true), []);
  const handlePointerUp = useCallback(() => setShowOriginal(false), []);

  const useFaceMode =
    faceRetouchEnabled &&
    faceRegions.length > 0 &&
    values.skinSmooth > 0 &&
    !showOriginal;

  // Base filter: all filters, but exclude blur when face mode is active
  const baseFilter = showOriginal
    ? "none"
    : buildFilterString(values, { excludeBlur: useFaceMode });

  // Overlay filter: includes blur (used only on face region)
  const overlayFilter = useFaceMode ? buildBlurFilterString(values) : "";

  const clipPath = useMemo(
    () => (useFaceMode ? buildMultiFaceClipPath(faceRegions) : "none"),
    [useFaceMode, faceRegions]
  );

  return (
    <div
      className="relative flex items-center justify-center h-full w-full overflow-hidden select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Base image layer — all filters except blur when face mode active */}
      <img
        id="retouch-preview"
        src={imageUrl}
        alt="Preview"
        className="max-w-full max-h-full object-contain transition-[filter] duration-150"
        style={{ filter: baseFilter }}
        draggable={false}
      />

      {/* Face blur overlay — same image with blur, clipped to face region */}
      {useFaceMode && (
        <img
          src={imageUrl}
          alt=""
          aria-hidden
          className="absolute max-w-full max-h-full object-contain transition-[filter,clip-path] duration-150 pointer-events-none"
          style={{
            filter: overlayFilter,
            clipPath,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          draggable={false}
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
