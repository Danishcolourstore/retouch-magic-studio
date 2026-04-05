/**
 * Film Grain Module
 *
 * Adds analog film grain to prevent overly digital/flat look
 * after heavy retouching. Configurable by tonal range.
 */

import type { PipelineContext } from "./types";

/**
 * Apply film grain to the processed image.
 *
 * TODO: Generate noise pattern and composite onto canvas.
 * - settings.grain.amount controls noise intensity (0–100)
 * - settings.grain.size controls particle size (0–100)
 * - settings.grain.applyTo restricts grain to specific tonal range:
 *     "shadows" — only dark areas
 *     "midtones" — only mid-luminosity
 *     "highlights" — only bright areas
 *     "all" — uniform application
 *
 * Use luminosity masking to restrict grain to the target range.
 * Grain should be monochromatic for a classic film look.
 */
export function applyFilmGrain(
  _ctx: PipelineContext
): HTMLCanvasElement {
  // TODO: Generate noise, mask by tonal range, composite onto canvas
  throw new Error("Not implemented");
}
