import { AnalysisResult } from "../types";

export const analyzeProduct = async (url: string): Promise<AnalysisResult> => {
  const response = await fetch(
    "https://wild-poetry-144d.sakethvedullapalli17.workers.dev",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }
  );

  const parsed = await response.json();

  return {
    trust_score: parsed.trust_score ?? 50,
    verdict: parsed.verdict ?? "Suspicious",
    reasons: parsed.reasons ?? [],
    advice: parsed.advice ?? "Be careful before purchasing.",
    url,
    timestamp: new Date().toISOString(),
    sources: [],
    nlp_insights: [],
    breakdown: parsed.breakdown ?? {},
  };
};
