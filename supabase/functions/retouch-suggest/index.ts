import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a high-end professional retoucher specializing in Indian wedding photography.

Your job is to guide a retouch pipeline, not perform edits.

Rules:
- Skin must remain natural (no plastic smoothing)
- Preserve pores and texture
- Avoid highlight clipping
- Maintain accurate Indian skin tones (Fitzpatrick III–VI)
- Avoid over-warming or green tint shifts

Decision Logic:
- Use frequency separation only when skin texture needs refinement
- Use dodge & burn for shaping face, not flattening
- Apply separate dodge & burn for outfits when fabric detail needs enhancement
- Add grain only when image looks overly digital or flat
- Never over-process

You MUST respond with ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "suggestion": "<short professional suggestion>",
  "adjustments": {
    "exposure": <number -50 to 50>,
    "contrast": <number -50 to 50>,
    "warmth": <number 0 to 50>,
    "tint": <number -30 to 30>,
    "skinSmooth": <number 0 to 50>
  },
  "advanced": {
    "frequencySeparation": {
      "enabled": <boolean>,
      "intensity": <number 0-100>
    },
    "dodgeBurn": {
      "face": <number -100 to 100>,
      "underEyes": <number -100 to 100>,
      "highlights": <number -100 to 100>
    },
    "outfitDodgeBurn": {
      "enabled": <boolean>,
      "intensity": <number 0-100>
    },
    "grain": {
      "enabled": <boolean>,
      "amount": <number 0-100>,
      "size": <number 0-100>,
      "applyTo": "shadows" | "midtones" | "highlights" | "all"
    }
  }
}

Only include adjustment keys that should change from current values. Return only JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      currentValues,
      lighting = "mixed",
      context = "portrait",
      faceDetected = false,
      skinCoverage = 0,
      outfitDetected = false,
    } = body;

    if (!currentValues || typeof currentValues !== "object") {
      return new Response(
        JSON.stringify({ error: "currentValues is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userMessage = JSON.stringify({
      currentValues,
      lighting,
      context,
      faceDetected,
      skinCoverage,
      outfitDetected,
    });

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response (strip markdown fences if present)
    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Unparseable AI response:", content);
      throw new Error("Invalid AI response format");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure - ensure required fields exist with defaults
    const result = {
      suggestion: parsed.suggestion || "No suggestion available.",
      adjustments: parsed.adjustments || {},
      advanced: {
        frequencySeparation: {
          enabled: false,
          intensity: 0,
          ...parsed.advanced?.frequencySeparation,
        },
        dodgeBurn: {
          face: 0,
          underEyes: 0,
          highlights: 0,
          ...parsed.advanced?.dodgeBurn,
        },
        outfitDodgeBurn: {
          enabled: false,
          intensity: 0,
          ...parsed.advanced?.outfitDodgeBurn,
        },
        grain: {
          enabled: false,
          amount: 0,
          size: 0,
          applyTo: "all" as const,
          ...parsed.advanced?.grain,
        },
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("retouch-suggest error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
