/**
 * Frequency Separation Module
 *
 * Splits an image into low-frequency (color/tone) and high-frequency
 * (texture/detail) layers for independent processing.
 */

import type { PipelineContext } from "./types";

/**
 * Extract the low-frequency layer from the source canvas.
 * Captures broad color and tonal information without fine texture.
 *
 * TODO: Implement Gaussian blur on source to produce low-freq layer.
 * Use settings.frequency.radius to control blur amount.
 */
export function createLowFrequency(
  _ctx: PipelineContext
): HTMLCanvasElement {
  // TODO: Apply blur to source canvas and return as new canvas
  throw new Error("Not implemented");
}

/**
 * Extract the high-frequency layer by subtracting low from source.
 * Contains skin pores, hair strands, fabric weave, and fine detail.
 *
 * TODO: Implement difference blend between source and low-freq layer.
 */
export function createHighFrequency(
  _ctx: PipelineContext,
  _lowFrequency: HTMLCanvasElement
): HTMLCanvasElement {
  // TODO: Subtract low-frequency from source to isolate texture
  throw new Error("Not implemented");
}

/**
 * Recombine processed low and high frequency layers.
 * Applies the edited low-freq with preserved high-freq texture.
 *
 * TODO: Implement additive blend of low + high frequency layers.
 * Use settings.frequency.intensity to control high-freq opacity.
 */
export function recombineFrequencies(
  _lowFrequency: HTMLCanvasElement,
  _highFrequency: HTMLCanvasElement,
  _intensity: number
): HTMLCanvasElement {
  // TODO: Blend layers back together with configurable intensity
  throw new Error("Not implemented");
}
