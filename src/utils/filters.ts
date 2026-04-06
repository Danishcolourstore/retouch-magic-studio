import type { RetouchValues, PresetConfig, SliderConfig } from "@/types";

export const defaultValues: RetouchValues = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  highlights: 0,
  shadows: 0,
  warmth: 0,
  tint: 0,
  skinSmooth: 0,
};

export const presets: PresetConfig[] = [
  {
    name: "Natural Clean",
    values: { exposure: 8, contrast: 10, saturation: 5, highlights: 0, shadows: 0, warmth: 5, tint: 0, skinSmooth: 0 },
  },
  {
    name: "Wedding Glow",
    values: { exposure: 12, contrast: -5, saturation: 10, highlights: 15, shadows: 10, warmth: 20, tint: -5, skinSmooth: 10 },
  },
  {
    name: "Soft Skin",
    values: { exposure: 5, contrast: -5, saturation: 0, highlights: 5, shadows: 5, warmth: 15, tint: 0, skinSmooth: 30 },
  },
  {
    name: "High Contrast",
    values: { exposure: -5, contrast: 40, saturation: 10, highlights: -10, shadows: -15, warmth: 0, tint: 0, skinSmooth: 0 },
  },
];

export const sliderConfig: SliderConfig[] = [
  { key: "exposure", label: "Exposure", min: -50, max: 50 },
  { key: "contrast", label: "Contrast", min: -50, max: 50 },
  { key: "saturation", label: "Saturation", min: -50, max: 50 },
  { key: "highlights", label: "Highlights", min: -50, max: 50 },
  { key: "shadows", label: "Shadows", min: -50, max: 50 },
  { key: "warmth", label: "Warmth", min: 0, max: 50 },
  { key: "tint", label: "Tint", min: -30, max: 30 },
  { key: "skinSmooth", label: "Skin Smooth", min: 0, max: 50 },
];

// Legacy CSS filter builders kept for compatibility but no longer primary
export function buildFilterString(
  v: RetouchValues,
  options?: { excludeBlur?: boolean }
): string {
  const blur = options?.excludeBlur ? 0 : (v.skinSmooth / 100) * 1.5;
  let filter = "none";
  if (blur > 0) filter = `blur(${blur}px)`;
  return filter;
}

export function buildBlurFilterString(v: RetouchValues): string {
  const blur = (v.skinSmooth / 100) * 1.5;
  if (blur > 0) return `blur(${blur}px)`;
  return "none";
}
