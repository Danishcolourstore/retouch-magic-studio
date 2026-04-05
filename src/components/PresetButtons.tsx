import React from "react";
import type { PresetConfig } from "@/types";

interface PresetButtonsProps {
  presets: PresetConfig[];
  activePreset: string | null;
  onSelect: (name: string) => void;
  onReset: () => void;
}

const PresetButtons: React.FC<PresetButtonsProps> = ({
  presets,
  activePreset,
  onSelect,
  onReset,
}) => {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Presets
        </span>
        <button
          onClick={onReset}
          className="text-xs text-muted-foreground active:text-foreground transition-colors min-h-[44px] px-2"
        >
          Reset
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => onSelect(p.name)}
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
  );
};

export default PresetButtons;
