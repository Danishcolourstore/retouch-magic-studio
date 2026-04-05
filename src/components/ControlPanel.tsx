import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import BottomSheet from "@/components/BottomSheet";
import PresetButtons from "@/components/PresetButtons";
import { presets, sliderConfig, defaultValues } from "@/utils/filters";
import type { RetouchValues } from "@/types";

interface ControlPanelProps {
  values: RetouchValues;
  onChange: (v: RetouchValues) => void;
  faceRetouchEnabled: boolean;
  onFaceRetouchToggle: (enabled: boolean) => void;
  faceDetected: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  values,
  onChange,
  faceRetouchEnabled,
  onFaceRetouchToggle,
  faceDetected,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);

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
    <BottomSheet expanded={expanded} onExpandedChange={setExpanded}>
      <PresetButtons
        presets={presets}
        activePreset={activePreset}
        onSelect={applyPreset}
        onReset={handleReset}
      />

      {/* Face Retouch toggle */}
      <div className="flex items-center justify-between mb-4 py-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Face Retouch</span>
          {faceDetected && faceRetouchEnabled && (
            <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              Active
            </span>
          )}
          {!faceDetected && (
            <span className="text-[10px] text-muted-foreground">
              No face
            </span>
          )}
        </div>
        <Switch
          checked={faceRetouchEnabled}
          onCheckedChange={onFaceRetouchToggle}
        />
      </div>

      <div className="space-y-4">
        {sliderConfig.map((s) => (
          <div key={s.key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-foreground">
                {s.label}
                {s.key === "skinSmooth" && faceRetouchEnabled && faceDetected && (
                  <span className="text-[10px] text-accent ml-1.5">face only</span>
                )}
              </span>
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
    </BottomSheet>
  );
};

export default ControlPanel;
