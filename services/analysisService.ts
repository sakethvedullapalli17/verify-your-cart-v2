import { AnalysisResult } from "../types";

export const analyzeProduct = async (url: string): Promise<AnalysisResult> => {
  const response = await fetch(
    "https://wild-poetry-144d.sakethvedullapalli17.workers.dev",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    }
  );

  const data = await response.json();

  // Gemini response text
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from backend AI");
  }

  // remove markdown json block if exists
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  // extract JSON object from text safely
  const match = text.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("Invalid JSON returned from AI");
  }

  const parsed = JSON.parse(match[0]);

  return {
    trust_score: parsed.trust_score ?? 50,
    verdict: parsed.verdict ?? "Suspicious",
    reasons: parsed.reasons ?? ["No clear reasons provided"],
    advice: parsed.advice ?? "Please verify before buying.",
    url,
    timestamp: new Date().toISOString(),
    sources: [],
    nlp_insights: parsed.nlp_insights ?? [],
    breakdown: parsed.breakdown ?? {},
  };
};
