import React, { useState, useRef, useCallback } from "react";
import { GripHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  type RetouchValues,
  presets,
  sliderConfig,
  defaultValues,
} from "@/lib/retouch";

interface ControlPanelProps {
  values: RetouchValues;
  onChange: (v: RetouchValues) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ values, onChange }) => {
  const [expanded, setExpanded] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const dragRef = useRef<{ startY: number; wasExpanded: boolean } | null>(null);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = { startY: e.clientY, wasExpanded: expanded };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [expanded]
  );

  const handleDragEnd = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const delta = e.clientY - dragRef.current.startY;
      if (Math.abs(delta) > 30) {
        setExpanded(delta < 0);
      }
      dragRef.current = null;
    },
    []
  );

  const applyPreset = (name: string) => {
    const preset = presets.find((p) => p.name === name);
    if (preset) {
      onChange({ ...preset.values });
      setActivePreset(name);
    }
  };

  const handleSliderChange = (key: keyof RetouchValues, val: number) => {
    onChange({ ...values, [key]: val });
    setActivePreset(null);
  };

  const handleReset = () => {
    onChange({ ...defaultValues });
    setActivePreset(null);
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl transition-all duration-300 ease-out ${
        expanded ? "max-h-[70vh]" : "max-h-16"
      }`}
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
      >
        <GripHorizontal className="w-6 h-6 text-muted-foreground" />
      </div>

      {expanded && (
        <div className="px-4 pb-6 overflow-y-auto max-h-[calc(70vh-3rem)]">
          {/* Presets */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Presets
              </span>
              <button
                onClick={handleReset}
                className="text-xs text-muted-foreground active:text-foreground transition-colors min-h-[44px] px-2"
              >
                Reset
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p.name)}
                  className={`shrink-0 min-h-[44px] px-4 rounded-lg text-sm font-medium transition-colors ${
                    activePreset === p.name
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground active:bg-muted"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            {sliderConfig.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground">{s.label}</span>
                  <span className="text-xs text-muted-foreground font-mono w-8 text-right">
                    {values[s.key]}
                  </span>
                </div>
                <Slider
                  min={s.min}
                  max={s.max}
                  step={1}
                  value={[values[s.key]]}
                  onValueChange={([v]) => handleSliderChange(s.key, v)}
                  className="touch-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
