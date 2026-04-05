import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import BottomSheet from "@/components/BottomSheet";
import PresetButtons from "@/components/PresetButtons";
import { presets, sliderConfig, defaultValues } from "@/utils/filters";
import type { RetouchValues } from "@/types";

interface ControlPanelProps {
  values: RetouchValues;
  onChange: (v: RetouchValues) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ values, onChange }) => {
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
    </BottomSheet>
  );
};

export default ControlPanel;
