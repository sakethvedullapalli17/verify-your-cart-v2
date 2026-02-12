import {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold
} from "@google/genai";

import { AnalysisResult } from "../types";
import { mockAnalyzeProduct } from "./mockAnalysisService";

/**
 * Advanced Forensic Analysis Service (Frontend)
 * Uses Gemini API with Google Search tool for fraud detection.
 */
export const analyzeProduct = async (url: string): Promise<AnalysisResult> => {
  const hostname = new URL(url).hostname;

  // ✅ Correct Vite Environment Variable Reading
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_API_KEY ||
    import.meta.env.API_KEY ||
    "";

  // If key missing, fallback to mock
  if (!apiKey) {
    console.warn("⚠️ API Key missing. Falling back to demo mode.");
    return await mockAnalyzeProduct(url);
  }

  const systemInstruction = `You are the TrustLens Forensic AI, an elite specialist in e-commerce fraud detection. 
  Your methodology is based on linguistic footprinting, market pricing forensics, and seller reputation grounding.

  Linguistic Footprinting Rules:
  - Identify generic sentiment: Bot reviews often use high-emotion, low-detail phrases (e.g., "Life changing", "Best ever").
  - Check for "Review Hijacking": Does the review text match the product category?
  - Syntax patterns: Detect excessive punctuation or repetitive sentence structures.
  
  Seller & Domain Forensics:
  - Grounding: Use Google Search to check domain registration period and "scam" keyword association.
  - Price Anomalies: Cross-reference market averages. If it's >50% lower than standard MSRP, flag as a bait scam.

  Always return a structured JSON response reflecting these forensic layers.`;

  const prompt = `Perform a deep forensic scan on this product URL: ${url}

  Step 1: Grounding Search
  Use your search tool to find this specific product/seller. Check for consumer reports or Reddit discussions about its legitimacy.
  
  Step 2: Linguistic Analysis
  If you were to see reviews on this platform (${hostname}), what linguistic markers (pros/cons) are typical for this specific item?
  
  Step 3: Score Compilation
  Calculate a Trust Score (0-100) based on:
  - Seller Authenticity (30%)
  - Price Realism (30%)
  - Linguistic Pattern Match (40%)

  Response Format (Valid JSON ONLY):
  {
    "trust_score": number,
    "verdict": "Genuine" | "Suspicious" | "Fake",
    "nlp_insights": ["Linguistic marker 1", "Linguistic marker 2"],
    "breakdown": {
      "reviews": ["Detailed review patterns found"],
      "sentiment": ["Sentiment vs Rating analysis"],
      "price": ["Price deviation analysis"],
      "seller": ["Seller trust history/domain age"],
      "description": ["Forensic text evaluation"]
    },
    "reasons": ["Key finding 1", "Key finding 2", "Key finding 3"],
    "advice": "Specific buyer warning or recommendation"
  }`;

  const config = {
    responseMimeType: "application/json",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
      }
    ],
    tools: [{ googleSearch: {} }]
  };

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        ...config,
        systemInstruction,
        temperature: 0.1
      }
    });

    if (!response || !response.text) {
      throw new Error("Analysis failed: Empty response");
    }

    // Extract JSON safely
    let jsonStr = response.text;
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const data = JSON.parse(jsonStr);

    // Extract sources from grounding metadata
    const sources =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((c: any) => c.web?.uri)
        .filter((uri: string) => uri) || [];

    return {
      trust_score: data.trust_score ?? 50,
      verdict: data.verdict ?? "Suspicious",
      reasons: data.reasons ?? ["Analysis completed with limited data."],
      nlp_insights: data.nlp_insights ?? [],
      advice:
        data.advice ??
        "Please verify this seller on other platforms before checkout.",
      url: url,
      timestamp: new Date().toISOString(),
      sources: sources,
      breakdown: data.breakdown
    };
  } catch (error: any) {
    console.error("Forensic AI Analysis Failed:", error);
    return await mockAnalyzeProduct(url);
  }
};
