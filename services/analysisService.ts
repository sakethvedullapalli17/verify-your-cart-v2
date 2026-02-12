import { AnalysisResult } from "../types";
import { mockAnalyzeProduct } from "./mockAnalysisService";

export const analyzeProduct = async (url: string): Promise<AnalysisResult> => {
  try {
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

    if (!response.ok) {
      throw new Error("Backend error: " + response.status);
    }

    const data = await response.json();

    // Gemini returns response inside candidates
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response from backend AI");
    }

    // sometimes Gemini adds ```json ... ``` so remove it
    const cleanText = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleanText);

    return {
      trust_score: parsed.trust_score ?? 50,
      verdict: parsed.verdict ?? "Suspicious",
      reasons: parsed.reasons ?? ["No reasons generated"],
      advice: parsed.advice ?? "Be careful before buying.",
      url,
      timestamp: new Date().toISOString(),
      sources: parsed.sources ?? [],
      nlp_insights: parsed.nlp_insights ?? [],
      breakdown: parsed.breakdown ?? {},
    };
  } catch (error) {
    console.error("AI Backend Failed:", error);

    // fallback demo mode
    return await mockAnalyzeProduct(url);
  }
};
