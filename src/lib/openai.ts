import { supabase } from "@/integrations/supabase/client";
import type {
  RetouchValues,
  AISuggestionResult,
  LightingCondition,
  PhotoContext,
} from "@/types";

export type { AISuggestionResult, LightingCondition, PhotoContext };

/**
 * Call the retouch-suggest edge function to get AI-powered
 * retouch decisions based on current slider values and scene context.
 *
 * Does NOT send any image data — only structured numeric values.
 */
export async function getAISuggestion(
  currentValues: RetouchValues,
  options: {
    lighting?: LightingCondition;
    context?: PhotoContext;
    faceDetected?: boolean;
    skinCoverage?: number;
    outfitDetected?: boolean;
  } = {}
): Promise<AISuggestionResult> {
  const {
    lighting = "mixed",
    context = "portrait",
    faceDetected = false,
    skinCoverage = 0,
    outfitDetected = false,
  } = options;

  const { data, error } = await supabase.functions.invoke("retouch-suggest", {
    body: {
      currentValues,
      lighting,
      context,
      faceDetected,
      skinCoverage,
      outfitDetected,
    },
  });

  if (error) {
    console.error("AI suggestion error:", error);
    throw new Error(error.message || "Failed to get AI suggestion");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    suggestion: data.suggestion || "No suggestion available.",
    adjustments: data.adjustments || {},
    advanced: data.advanced || {
      frequencySeparation: { enabled: false, intensity: 0 },
      dodgeBurn: { face: 0, underEyes: 0, highlights: 0 },
      outfitDodgeBurn: { enabled: false, intensity: 0 },
      grain: { enabled: false, amount: 0, size: 0, applyTo: "all" },
    },
  };
}
