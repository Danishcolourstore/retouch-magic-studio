/**
 * Canvas-based image processor using HSL color space.
 * All adjustments operate on pixel data for real processing.
 */

import type { RetouchValues } from "@/types";

// --- HSL ↔ RGB helpers ---

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function clamp(v: number, min = 0, max = 255): number {
  return v < min ? min : v > max ? max : v;
}

/**
 * Process image pixel data with the given retouch values.
 * Operates in HSL space for saturation/warmth/tint,
 * and linear space for exposure/contrast/highlights/shadows.
 */
export function processPixels(
  src: ImageData,
  dst: ImageData,
  values: RetouchValues
): void {
  const d = src.data;
  const out = dst.data;
  const len = d.length;

  // Pre-compute factors
  const exposureFactor = 1 + values.exposure / 50; // ±50 → 0..2
  const contrastFactor = 1 + values.contrast / 50;
  const saturationShift = values.saturation / 50; // -1..1
  const highlightShift = values.highlights / 100; // -0.5..0.5
  const shadowShift = values.shadows / 100;
  const warmthShift = values.warmth / 200; // 0..0.25 hue shift toward warm
  const tintShift = values.tint / 200; // hue shift for tint

  for (let i = 0; i < len; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];

    // 1. Exposure (multiply luminance)
    r *= exposureFactor;
    g *= exposureFactor;
    b *= exposureFactor;

    // 2. Contrast (pivot around 128)
    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;

    // Convert to HSL for color adjustments
    let [h, s, l] = rgbToHsl(clamp(r), clamp(g), clamp(b));

    // 3. Highlights (brighten bright areas) & Shadows (brighten dark areas)
    if (l > 0.5 && highlightShift !== 0) {
      const weight = (l - 0.5) * 2; // 0..1 for bright pixels
      l = l + highlightShift * weight * 0.5;
    }
    if (l < 0.5 && shadowShift !== 0) {
      const weight = (0.5 - l) * 2; // 0..1 for dark pixels
      l = l + shadowShift * weight * 0.5;
    }
    l = Math.max(0, Math.min(1, l));

    // 4. Saturation
    s = Math.max(0, Math.min(1, s + saturationShift * s));
    // Prevent desaturated pixels from going negative
    if (saturationShift < 0) {
      s = Math.max(0, s * (1 + saturationShift));
    }

    // 5. Warmth — shift hue slightly toward orange/yellow
    if (warmthShift > 0) {
      // Push reds/yellows warmer, blues cooler
      h = h - warmthShift * 0.05;
      if (h < 0) h += 1;
      // Slight saturation boost for warmth feel
      s = Math.min(1, s + warmthShift * 0.15);
    }

    // 6. Tint — hue rotation
    if (tintShift !== 0) {
      h = h + tintShift * 0.1;
      if (h < 0) h += 1;
      if (h > 1) h -= 1;
    }

    const [rr, gg, bb] = hslToRgb(h, s, l);
    out[i] = rr;
    out[i + 1] = gg;
    out[i + 2] = bb;
    out[i + 3] = d[i + 3]; // alpha
  }
}

/**
 * Create an offscreen canvas from an HTMLImageElement and cache the original pixel data.
 */
export function getOriginalPixels(img: HTMLImageElement): {
  width: number;
  height: number;
  imageData: ImageData;
} {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return {
    width: canvas.width,
    height: canvas.height,
    imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
  };
}
