/**
 * OpenAI suggestion helper (OPTIONAL).
 *
 * This module provides AI-powered retouch suggestions based on image metadata.
 * It requires Lovable Cloud to be enabled for the LOVABLE_API_KEY.
 *
 * Currently stubbed for frontend-only use — returns a static suggestion.
 * Enable Lovable Cloud and create an edge function to activate real AI suggestions.
 */

export interface RetouchSuggestion {
  text: string;
  source: "ai" | "fallback";
}

/**
 * Get a retouch suggestion based on image metadata.
 * Does NOT send the actual image — only dimensions and filename info.
 */
export async function getRetouchSuggestion(metadata: {
  width: number;
  height: number;
  filename?: string;
}): Promise<RetouchSuggestion> {
  // Fallback suggestions when AI is not available
  const fallbacks: string[] = [
    "Try adding slight warmth for a natural skin tone look.",
    "A subtle exposure boost can brighten portraits.",
    "Use Skin Smooth gently — less is more for a natural finish.",
    "Wedding shots benefit from a warm glow preset.",
    "High contrast works well for dramatic black & white edits.",
  ];

  // TODO: When Lovable Cloud is enabled, replace with edge function call:
  // const { data } = await supabase.functions.invoke('retouch-suggest', {
  //   body: { metadata }
  // });

  const random = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return { text: random, source: "fallback" };
}
