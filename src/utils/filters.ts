import type { RetouchValues, PresetConfig, SliderConfig } from "@/types";

export const defaultValues: RetouchValues = {
  exposure: 0,
  contrast: 0,
  warmth: 0,
  tint: 0,
  skinSmooth: 0,
};

export const presets: PresetConfig[] = [
  {
    name: "Natural Clean",
    values: { exposure: 8, contrast: 10, warmth: 5, tint: 0, skinSmooth: 0 },
  },
  {
    name: "Wedding Glow",
    values: { exposure: 12, contrast: -5, warmth: 20, tint: -5, skinSmooth: 10 },
  },
  {
    name: "Soft Skin",
    values: { exposure: 5, contrast: -5, warmth: 15, tint: 0, skinSmooth: 30 },
  },
  {
    name: "High Contrast",
    values: { exposure: -5, contrast: 40, warmth: 0, tint: 0, skinSmooth: 0 },
  },
];

export const sliderConfig: SliderConfig[] = [
  { key: "exposure", label: "Exposure", min: -50, max: 50 },
  { key: "contrast", label: "Contrast", min: -50, max: 50 },
  { key: "warmth", label: "Warmth", min: 0, max: 50 },
  { key: "tint", label: "Tint", min: -30, max: 30 },
  { key: "skinSmooth", label: "Skin Smooth", min: 0, max: 50 },
];

export function buildFilterString(v: RetouchValues): string {
  const brightness = 1 + v.exposure / 100;
  const contrast = 1 + v.contrast / 100;
  const sepia = v.warmth / 100;
  const hueRotate = v.tint;
  const blur = (v.skinSmooth / 100) * 1.5;

  let filter = `brightness(${brightness}) contrast(${contrast})`;
  if (sepia > 0) filter += ` sepia(${sepia})`;
  if (hueRotate !== 0) filter += ` hue-rotate(${hueRotate}deg)`;
  if (blur > 0) filter += ` blur(${blur}px)`;
  return filter;
}
