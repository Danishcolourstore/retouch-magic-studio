import { supabase } from "@/integrations/supabase/client";
import type { RetouchValues } from "@/types";

export interface AISuggestionResult {
  suggestion: string;
  adjustments: Partial<RetouchValues>;
}

export type LightingCondition = "low" | "mixed" | "bright";
export type PhotoContext = "wedding" | "portrait" | "indoor" | "night";

/**
 * Call the retouch-suggest edge function to get AI-powered
 * retouch recommendations based on current slider values.
 *
 * Does NOT send any image data — only structured numeric values.
 */
export async function getAISuggestion(
  currentValues: RetouchValues,
  lighting: LightingCondition = "mixed",
  context: PhotoContext = "portrait"
): Promise<AISuggestionResult> {
  const { data, error } = await supabase.functions.invoke("retouch-suggest", {
    body: { currentValues, lighting, context },
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
  };
}
