export interface RetouchValues {
  exposure: number;
  contrast: number;
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
