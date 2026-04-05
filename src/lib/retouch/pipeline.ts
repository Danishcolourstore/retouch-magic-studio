/**
 * Retouch Pipeline Orchestrator
 *
 * Combines all retouch stages in the correct order:
 *   1. Skin mask generation
 *   2. Frequency separation (on skin regions)
 *   3. Dodge & burn (face, under-eyes, outfit)
 *   4. Film grain
 *
 * Each stage is optional based on RetouchSettings.
 */

import type { RetouchSettings, PipelineContext, PipelineResult } from "./types";

/**
 * Run the full retouch pipeline on a source canvas.
 *
 * TODO: Orchestrate all stages in sequence:
 *   1. Build PipelineContext from source + settings
 *   2. If skinMaskEnabled → generateSkinMask() → refineSkinMask()
 *   3. If frequency.enabled → createLowFrequency() → createHighFrequency()
 *      → process low-freq → recombineFrequencies()
 *   4. If dodgeBurn values non-zero → applyFaceDodgeBurn(), applyUnderEyeCorrection()
 *   5. If dodgeBurn.outfit.enabled → applyOutfitDodgeBurn()
 *   6. If grain.enabled → applyFilmGrain()
 *   7. Return final canvas + list of applied stages
 *
 * Each stage should be skippable and independently toggleable.
 * Pipeline must be non-destructive — never mutate the source canvas.
 */
export function runRetouchPipeline(
  _sourceCanvas: HTMLCanvasElement,
  _settings: RetouchSettings
): PipelineResult {
  // TODO: Orchestrate stages, track which were applied, return result
  throw new Error("Not implemented");
}
