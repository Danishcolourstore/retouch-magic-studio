import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import PresetButtons from "@/components/PresetButtons";
import AdvancedPanel from "@/components/AdvancedPanel";
import { presets, sliderConfig, defaultValues } from "@/utils/filters";
import { getAISuggestion } from "@/lib/openai";
import type { RetouchValues, AISuggestionResult } from "@/types";
import { toast } from "sonner";

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
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AISuggestionResult | null>(null);

  const applyPreset = (name: string) => {
    const preset = presets.find((p) => p.name === name);
    if (preset) {
      onChange({ ...preset.values });
      setActivePreset(name);
      setAiResult(null);
    }
  };

  const handleSliderChange = (key: keyof RetouchValues, val: number) => {
    onChange({ ...values, [key]: val });
    setActivePreset(null);
  };

  const handleReset = () => {
    onChange({ ...defaultValues });
    setActivePreset(null);
    setAiResult(null);
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    try {
      const result = await getAISuggestion(values, {
        faceDetected,
        skinCoverage: faceDetected ? 30 : 0,
        outfitDetected: true,
      });
      setAiResult(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI suggestion failed";
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAI = () => {
    if (!aiResult?.adjustments) return;
    const next = { ...values, ...aiResult.adjustments };
    onChange(next);
    setActivePreset(null);
    toast.success("AI adjustments applied");
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <PresetButtons
        presets={presets}
        activePreset={activePreset}
        onSelect={applyPreset}
        onReset={handleReset}
      />

      {/* AI Suggest */}
      <div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAISuggest}
            disabled={aiLoading}
            className="min-h-[44px] gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {aiLoading ? "Thinking…" : "AI Suggest"}
          </Button>
          {aiResult && (
            <Button
              variant="default"
              size="sm"
              onClick={handleApplyAI}
              className="min-h-[44px]"
            >
              Apply
            </Button>
          )}
        </div>
        {aiResult && (
          <>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              💡 {aiResult.suggestion}
            </p>
            <AdvancedPanel advanced={aiResult.advanced} />
          </>
        )}
      </div>

      {/* Face Retouch toggle */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Face Retouch</span>
          {faceDetected && faceRetouchEnabled && (
            <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              Active
            </span>
          )}
          {!faceDetected && (
            <span className="text-[10px] text-muted-foreground">No face</span>
          )}
        </div>
        <Switch
          checked={faceRetouchEnabled}
          onCheckedChange={onFaceRetouchToggle}
        />
      </div>

      {/* Sliders */}
      <div className="space-y-4 pb-8">
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
    </div>
  );
};

export default ControlPanel;
