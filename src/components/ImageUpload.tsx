import React, { useRef } from "react";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onImageLoad: (url: string, width: number, height: number) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageLoad }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => onImageLoad(url, img.naturalWidth, img.naturalHeight);
    img.src = url;
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 h-full w-full cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
        <Upload className="w-7 h-7 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-foreground font-medium text-base">Upload Image</p>
        <p className="text-muted-foreground text-sm mt-1">JPG or PNG</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

export default ImageUpload;
