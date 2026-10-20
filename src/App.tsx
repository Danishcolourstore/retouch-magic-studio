import { useEffect, useMemo, useState } from "react";
import { Download, ImagePlus, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type Mode = "natural" | "ultra";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [mode, setMode] = useState<Mode>("ultra");
  const [strength, setStrength] = useState(68);
  const [compare, setCompare] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<string>("");

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    };
  }, [originalUrl, enhancedUrl]);

  const outputName = useMemo(() => {
    if (!file) return "natural-restore.jpg";
    const dot = file.name.lastIndexOf(".");
    const base = dot > 0 ? file.name.slice(0, dot) : file.name;
    const ext = dot > 0 ? file.name.slice(dot) : ".jpg";
    return `${base}-restored${ext}`;
  }, [file]);

  const selectFile = (next: File | null) => {
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setError("Choose a JPEG or PNG image.");
      return;
    }
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    const url = URL.createObjectURL(next);
    setFile(next);
    setOriginalUrl(url);
    setEnhancedUrl(null);
    setEnhancedBlob(null);
    setError(null);
    setCompare(50);

    const img = new Image();
    img.onload = () => setDimensions(`${img.naturalWidth} × ${img.naturalHeight}`);
    img.src = url;
  };

  const enhance = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("mode", mode);
      form.append("strength", String(strength));

      const response = await fetch(`${API_URL}/enhance`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Enhancement failed");
      }

      const blob = await response.blob();
      if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
      const url = URL.createObjectURL(blob);
      setEnhancedBlob(blob);
      setEnhancedUrl(url);
      setCompare(50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enhancement failed");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!enhancedBlob || !enhancedUrl) return;
    const a = document.createElement("a");
    a.href = enhancedUrl;
    a.download = outputName;
    a.click();
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">COLOUR STORE LAB</p>
          <h1>Natural Restore</h1>
        </div>
        {enhancedUrl && (
          <button className="icon-button" onClick={download} aria-label="Save restored image">
            <Download size={20} />
          </button>
        )}
      </header>

      {!originalUrl ? (
        <label className="empty-state">
          <input
            type="file"
            accept="image/jpeg,image/png"
            hidden
            onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
          />
          <div className="upload-icon"><ImagePlus size={26} /></div>
          <h2>Open a photo</h2>
          <p>Same resolution. No fake upscale. Natural detail only.</p>
          <span className="primary-button">Choose photo</span>
        </label>
      ) : (
        <>
          <section className="viewer">
            <img className="base-image" src={originalUrl} alt="Original" />
            {enhancedUrl && (
              <>
                <div className="enhanced-layer" style={{ width: `${compare}%` }}>
                  <img className="overlay-image" src={enhancedUrl} alt="Restored" />
                </div>
                <div className="divider" style={{ left: `${compare}%` }}>
                  <span className="divider-handle" />
                </div>
                <span className="tag tag-left">RESTORED</span>
                <span className="tag tag-right">ORIGINAL</span>
                <input
                  className="compare-range"
                  type="range"
                  min="0"
                  max="100"
                  value={compare}
                  onChange={(e) => setCompare(Number(e.target.value))}
                  aria-label="Before and after comparison"
                />
              </>
            )}
          </section>

          <section className="panel">
            <div className="file-row">
              <div>
                <strong>{file?.name}</strong>
                <span>{dimensions} · output stays same size</span>
              </div>
              <label className="replace-button">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  hidden
                  onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
                />
                Replace
              </label>
            </div>

            <div className="segmented">
              <button className={mode === "natural" ? "active" : ""} onClick={() => setMode("natural")}>Natural</button>
              <button className={mode === "ultra" ? "active" : ""} onClick={() => setMode("ultra")}>Ultra</button>
            </div>

            <div className="slider-block">
              <div className="slider-label"><span>Restoration strength</span><strong>{strength}</strong></div>
              <input type="range" min="0" max="100" value={strength} onChange={(e) => setStrength(Number(e.target.value))} />
              <p>Ultra uses stronger same-resolution restoration, then blends detail back with the original to avoid plastic skin or invented texture.</p>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button className="enhance-button" disabled={busy} onClick={enhance}>
              <Sparkles size={18} />
              {busy ? "Restoring…" : enhancedUrl ? "Restore again" : "Restore photo"}
            </button>

            {enhancedUrl && (
              <button className="save-button" onClick={download}>
                <Download size={18} /> Save full-quality file
              </button>
            )}

            <p className="footnote">JPEG exports at quality 97 with original ICC/EXIF preserved where possible. PNG remains PNG.</p>
          </section>
        </>
      )}
    </main>
  );
}

export default App;
