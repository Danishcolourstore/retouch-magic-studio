import React, { useState, useCallback } from "react";
import { buildFilterString } from "@/utils/filters";
import { Badge } from "@/components/ui/badge";
import type { RetouchValues } from "@/types";

interface ImagePreviewProps {
  imageUrl: string;
  width: number;
  height: number;
  values: RetouchValues;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  width,
  height,
  values,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);

  const handlePointerDown = useCallback(() => setShowOriginal(true), []);
  const handlePointerUp = useCallback(() => setShowOriginal(false), []);

  const filterStyle = showOriginal ? "none" : buildFilterString(values);

  return (
    <div
      className="relative flex items-center justify-center h-full w-full overflow-hidden select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        id="retouch-preview"
        src={imageUrl}
        alt="Preview"
        className="max-w-full max-h-full object-contain transition-[filter] duration-150"
        style={{ filter: filterStyle }}
        draggable={false}
      />
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
