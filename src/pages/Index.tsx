import React, { useState, useCallback } from "react";
import { Download, Upload } from "lucide-react";
import { toPng } from "html-to-image";
import ImageUpload from "@/components/ImageUpload";
import ImagePreview from "@/components/ImagePreview";
import ControlPanel from "@/components/ControlPanel";
import { type RetouchValues, defaultValues } from "@/lib/retouch";

const Index: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [values, setValues] = useState<RetouchValues>({ ...defaultValues });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageLoad = useCallback(
    (url: string, width: number, height: number) => {
      setImageUrl(url);
      setDimensions({ width, height });
      setValues({ ...defaultValues });
    },
    []
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
          <div className="flex gap-1">
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
              />
            </div>
            <ControlPanel values={values} onChange={setValues} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
