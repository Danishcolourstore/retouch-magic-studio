import React from "react";
import type { AdvancedRetouch } from "@/types";

interface AdvancedPanelProps {
  advanced: AdvancedRetouch;
}

const Stat: React.FC<{ label: string; value: string | number; active?: boolean }> = ({
  label,
  value,
  active = true,
}) => (
  <div className="flex items-center justify-between">
    <span className={`text-xs ${active ? "text-foreground" : "text-muted-foreground"}`}>
      {label}
    </span>
    <span className="text-xs font-mono text-muted-foreground">{value}</span>
  </div>
);

const AdvancedPanel: React.FC<AdvancedPanelProps> = ({ advanced }) => {
  const { frequencySeparation, dodgeBurn, outfitDodgeBurn, grain } = advanced;

  const hasAny =
    frequencySeparation.enabled ||
    dodgeBurn.face !== 0 ||
    dodgeBurn.underEyes !== 0 ||
    dodgeBurn.highlights !== 0 ||
    outfitDodgeBurn.enabled ||
    grain.enabled;

  if (!hasAny) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-3">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        Advanced Decisions
      </span>

      {frequencySeparation.enabled && (
        <div className="space-y-1">
          <span className="text-xs text-foreground font-medium">Frequency Separation</span>
          <Stat label="Intensity" value={frequencySeparation.intensity} />
        </div>
      )}

      {(dodgeBurn.face !== 0 || dodgeBurn.underEyes !== 0 || dodgeBurn.highlights !== 0) && (
        <div className="space-y-1">
          <span className="text-xs text-foreground font-medium">Dodge & Burn</span>
          {dodgeBurn.face !== 0 && <Stat label="Face" value={dodgeBurn.face > 0 ? `+${dodgeBurn.face}` : dodgeBurn.face} />}
          {dodgeBurn.underEyes !== 0 && <Stat label="Under Eyes" value={dodgeBurn.underEyes > 0 ? `+${dodgeBurn.underEyes}` : dodgeBurn.underEyes} />}
          {dodgeBurn.highlights !== 0 && <Stat label="Highlights" value={dodgeBurn.highlights > 0 ? `+${dodgeBurn.highlights}` : dodgeBurn.highlights} />}
        </div>
      )}

      {outfitDodgeBurn.enabled && (
        <div className="space-y-1">
          <span className="text-xs text-foreground font-medium">Outfit D&B</span>
          <Stat label="Intensity" value={outfitDodgeBurn.intensity} />
        </div>
      )}

      {grain.enabled && (
        <div className="space-y-1">
          <span className="text-xs text-foreground font-medium">Grain</span>
          <Stat label="Amount" value={grain.amount} />
          <Stat label="Size" value={grain.size} />
          <Stat label="Apply to" value={grain.applyTo} />
        </div>
      )}
    </div>
  );
};

export default AdvancedPanel;
