/**
 * Dodge & Burn Module
 *
 * Non-destructive luminosity adjustments for facial contouring,
 * under-eye correction, and outfit fabric enhancement.
 */

import type { PipelineContext } from "./types";

/**
 * Apply dodge & burn to face region for natural contouring.
 * Dodges (brightens) prominent areas, burns (darkens) recesses.
 *
 * TODO: Implement luminosity-based dodge/burn using face landmarks.
 * Use settings.dodgeBurn.face for intensity (-100 to +100).
 * Positive = more contouring, negative = flatten.
 */
export function applyFaceDodgeBurn(
  _ctx: PipelineContext
): HTMLCanvasElement {
  // TODO: Apply targeted luminosity shifts to face contour zones
  throw new Error("Not implemented");
}

/**
 * Brighten under-eye area to reduce dark circles.
 *
 * TODO: Implement targeted brightening below eye landmarks.
 * Use settings.dodgeBurn.underEyes for intensity.
 * Must blend naturally into surrounding skin.
 */
export function applyUnderEyeCorrection(
  _ctx: PipelineContext
): HTMLCanvasElement {
  // TODO: Dodge under-eye region with soft falloff
  throw new Error("Not implemented");
}

/**
 * Enhance outfit fabric detail and texture with dodge & burn.
 *
 * TODO: Implement fabric-aware dodge/burn outside skin mask regions.
 * Use settings.dodgeBurn.outfit.intensity for strength.
 * Should enhance embroidery, silk sheen, and textile detail.
 */
export function applyOutfitDodgeBurn(
  _ctx: PipelineContext
): HTMLCanvasElement {
  // TODO: Apply dodge/burn to non-skin regions for fabric enhancement
  throw new Error("Not implemented");
}
