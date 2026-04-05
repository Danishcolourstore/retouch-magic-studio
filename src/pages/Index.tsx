import React, { useState, useCallback, useRef, useEffect } from "react";
import { Download, Upload } from "lucide-react";
import { toPng } from "html-to-image";
import ImageUpload from "@/components/ImageUpload";
import ImagePreview from "@/components/ImagePreview";
import ControlPanel from "@/components/ControlPanel";
import { defaultValues } from "@/utils/filters";
import { detectFaces, type FaceRegion } from "@/lib/mediapipe";
import { getRetouchSuggestion } from "@/lib/openai";
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
  const [suggestion, setSuggestion] = useState<string | null>(null);
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
      setSuggestion(null);

      // Run face detection
      runFaceDetection(url);

      // Get AI suggestion
      const result = await getRetouchSuggestion({ width, height });
      setSuggestion(result.text);
    },
    [runFaceDetection]
  );

  const handleExport = useCallback(async () => {
    const el = document.getElementById("retouch-preview");
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "retouch-export.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
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
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0 border-b border-border">
        <h1 className="text-sm font-semibold text-foreground tracking-tight">
          Retouch Studio
        </h1>
        {imageUrl && (
          <div className="flex items-center gap-1">
            {/* Face detection indicator */}
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

      {/* AI Suggestion banner */}
      {suggestion && imageUrl && (
        <div className="px-4 py-1.5 border-b border-border">
          <p className="text-xs text-muted-foreground italic">💡 {suggestion}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {!imageUrl ? (
          <ImageUpload onImageLoad={handleImageLoad} />
        ) : (
          <>
            <div className="absolute inset-0 pb-16">
              <ImagePreview
                imageUrl={imageUrl}
                width={dimensions.width}
                height={dimensions.height}
                values={values}
                faceRegions={faceRegions}
                faceRetouchEnabled={faceRetouchEnabled}
              />
            </div>
            <ControlPanel
              values={values}
              onChange={setValues}
              faceRetouchEnabled={faceRetouchEnabled}
              onFaceRetouchToggle={setFaceRetouchEnabled}
              faceDetected={faceState.detected}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
