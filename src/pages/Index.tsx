import React, { useState, useCallback, useRef } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import ImagePreview from "@/components/ImagePreview";
import ControlPanel from "@/components/ControlPanel";
import { defaultValues } from "@/utils/filters";
import { detectFaces, type FaceRegion } from "@/lib/mediapipe";
import type { RetouchValues, ImageDimensions, FaceDetectionState } from "@/types";

const Index: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [values, setValues] = useState<RetouchValues>({ ...defaultValues });
  const [faceRetouchEnabled, setFaceRetouchEnabled] = useState(true);
  const [faceState, setFaceState] = useState<FaceDetectionState>({
    detected: false,
    count: 0,
    loading: false,
  });
  const [faceRegions, setFaceRegions] = useState<FaceRegion[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runFaceDetection = useCallback(async (url: string) => {
    setFaceState({ detected: false, count: 0, loading: true });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });

    const regions = await detectFaces(img);
    setFaceRegions(regions);
    setFaceState({
      detected: regions.length > 0,
      count: regions.length,
      loading: false,
    });
  }, []);

  const handleImageLoad = useCallback(
    async (url: string, width: number, height: number) => {
      setImageUrl(url);
      setDimensions({ width, height });
      setValues({ ...defaultValues });
      runFaceDetection(url);
    },
    [runFaceDetection]
  );

  const handleExport = useCallback(async () => {
    const canvas = document.getElementById("retouch-preview") as HTMLCanvasElement | null;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "retouch-export.png";
      link.href = dataUrl;
      link.click();
      toast.success("Image exported");
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Export failed");
    }
  }, []);

  const handleNewUpload = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => handleImageLoad(url, img.naturalWidth, img.naturalHeight);
    img.src = url;
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0 border-b border-border">
        <h1 className="text-sm font-semibold text-foreground tracking-tight">
          Retouch Studio
        </h1>
        {imageUrl && (
          <div className="flex items-center gap-1">
            {faceState.loading ? (
              <span className="text-xs text-muted-foreground px-2">Scanning…</span>
            ) : faceState.detected ? (
              <span className="text-xs text-accent px-2">
                👤 {faceState.count} face{faceState.count > 1 ? "s" : ""}
              </span>
            ) : null}
            <button
              onClick={handleNewUpload}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground active:text-foreground transition-colors"
              aria-label="Upload new image"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground active:text-foreground transition-colors"
              aria-label="Download image"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Content — stacked: image on top, controls below */}
      {!imageUrl ? (
        <div className="flex-1 overflow-hidden">
          <ImageUpload onImageLoad={handleImageLoad} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Image preview — always visible, takes ~45% of remaining space */}
          <div className="shrink-0 h-[45vh] min-h-[200px] border-b border-border">
            <ImagePreview
              imageUrl={imageUrl}
              width={dimensions.width}
              height={dimensions.height}
              values={values}
              faceRegions={faceRegions}
              faceRetouchEnabled={faceRetouchEnabled}
            />
          </div>

          {/* Controls — scrollable bottom section */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <ControlPanel
              values={values}
              onChange={setValues}
              faceRetouchEnabled={faceRetouchEnabled}
              onFaceRetouchToggle={setFaceRetouchEnabled}
              faceDetected={faceState.detected}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
