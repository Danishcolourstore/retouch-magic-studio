export interface RetouchValues {
  exposure: number;
  contrast: number;
  saturation: number;
  highlights: number;
  shadows: number;
  warmth: number;
  tint: number;
  skinSmooth: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface PresetConfig {
  name: string;
  values: RetouchValues;
}

export interface SliderConfig {
  key: keyof RetouchValues;
  label: string;
  min: number;
  max: number;
}

export interface FaceDetectionState {
  detected: boolean;
  count: number;
  loading: boolean;
}

// Advanced retouch decision types from AI

export interface FrequencySeparation {
  enabled: boolean;
  intensity: number; // 0–100
}

export interface DodgeBurn {
  face: number;       // -100 to +100
  underEyes: number;
  highlights: number;
}

export interface OutfitDodgeBurn {
  enabled: boolean;
  intensity: number; // 0–100
}

export interface Grain {
  enabled: boolean;
  amount: number;  // 0–100
  size: number;    // 0–100
  applyTo: "shadows" | "midtones" | "highlights" | "all";
}

export interface AdvancedRetouch {
  frequencySeparation: FrequencySeparation;
  dodgeBurn: DodgeBurn;
  outfitDodgeBurn: OutfitDodgeBurn;
  grain: Grain;
}

export interface AISuggestionResult {
  suggestion: string;
  adjustments: Partial<RetouchValues>;
  advanced: AdvancedRetouch;
}

export type LightingCondition = "low" | "mixed" | "bright";
export type PhotoContext = "wedding" | "portrait" | "indoor" | "night";
