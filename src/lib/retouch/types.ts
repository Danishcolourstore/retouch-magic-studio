/** Retouch pipeline type definitions */

export interface RetouchSettings {
  frequency: FrequencySettings;
  dodgeBurn: DodgeBurnSettings;
  grain: GrainSettings;
  skinMaskEnabled: boolean;
}

export interface FrequencySettings {
  enabled: boolean;
  /** Blur radius for low-frequency layer extraction (0–100) */
  radius: number;
  /** Blend intensity of high-frequency detail back onto skin (0–100) */
  intensity: number;
}

export interface DodgeBurnSettings {
  /** Face contouring strength (-100 to +100) */
  face: number;
  /** Under-eye brightening (-100 to +100) */
  underEyes: number;
  /** Highlight recovery (-100 to +100) */
  highlights: number;
  /** Outfit fabric enhancement */
  outfit: {
    enabled: boolean;
    intensity: number; // 0–100
  };
}

export interface GrainSettings {
  enabled: boolean;
  /** Grain amount (0–100) */
  amount: number;
  /** Grain particle size (0–100) */
  size: number;
  /** Which tonal range receives grain */
  applyTo: "shadows" | "midtones" | "highlights" | "all";
}

/** Pixel region mask — normalized coordinates (0–1) */
export interface MaskRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Intermediate result passed between pipeline stages */
export interface PipelineContext {
  sourceCanvas: HTMLCanvasElement;
  skinMask: MaskRegion[] | null;
  settings: RetouchSettings;
}

/** Final output of the retouch pipeline */
export interface PipelineResult {
  canvas: HTMLCanvasElement;
  appliedStages: string[];
}
