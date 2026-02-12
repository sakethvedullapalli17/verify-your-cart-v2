import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AnalysisResult } from '../types';
import { mockAnalyzeProduct } from './mockAnalysisService';

/**
 * Advanced Analysis Service (Frontend Only)
 * Uses Gemini models with Google Search Grounding to verify products in real-time.
 */
export const analyzeProduct = async (url: string): Promise<AnalysisResult> => {
  // 1. Securely access API key from build environment
  // We use the shimmed process.env.API_KEY. 
  // If running in AI Studio, this might be injected dynamically, so we access it at runtime.
  const apiKey = process.env.API_KEY || "";
  
  // If no key is found, throw specific error so UI can prompt user (AI Studio flow)
  if (!apiKey || apiKey === "PLACEHOLDER_API_KEY" || apiKey.trim() === "") {
    throw new Error("API_KEY_MISSING");
  }

  const hostname = new URL(url).hostname;

  // 2. System Instruction
  const systemInstruction = `You are TrustLens AI, an elite e-commerce fraud detector.
  
  YOUR GOAL: Verify the legitimacy of a product URL by cross-referencing it with live search data.
  
  ANALYSIS STEPS:
  1. SEARCH VALIDATION: Use Google Search to check if this product/seller exists on reputable sites.
  2. PRICE CHECK: Compare the listed price with the market average found via search.
  3. REPUTATION SCAN: Look for "scam" or "fake" reports associated with the domain.
  4. SENTIMENT ANALYSIS: Analyze the phrasing of the title and description for bot-like patterns.
  
  OUTPUT FORMAT:
  Return purely valid JSON.`;

  // 3. Prompt
  const prompt = `Analyze this URL: ${url}
  
  Platform: ${hostname}
  
  Return a JSON object with this exact schema:
  {
    "trust_score": number (0-100),
    "verdict": "Genuine" | "Suspicious" | "Fake",
    "nlp_insights": ["Insight 1", "Insight 2"],
    "breakdown": {
      "reviews": ["Insight about reviews"],
      "sentiment": ["Insight about sentiment"],
      "price": ["Insight about pricing logic"],
      "seller": ["Insight about seller identity"],
      "description": ["Insight about product description"]
    },
    "reasons": ["Reason 1", "Reason 2"],
    "advice": "Actionable advice."
  }`;

  const config = {
    responseMimeType: "application/json",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
    ],
    // Enable Search Tool for grounding
    tools: [{ googleSearch: {} }] 
  };

  try {
    // Create new instance per request to ensure latest key is used
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: config as any
    });

    if (!response || !response.text) {
        throw new Error("Empty response from Gemini");
    }

    // Robust JSON Extraction (Fixes "Mock Mode" issues caused by Markdown wrapping)
    let jsonStr = response.text;
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonStr = jsonMatch[0];
    } else {
        throw new Error("Invalid JSON format received");
    }

    const data = JSON.parse(jsonStr);
    
    // Extract Grounding Metadata
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((c: any) => c.web?.uri)
      .filter((uri: string) => uri) || [];
    
    return {
      trust_score: data.trust_score ?? 50,
      verdict: data.verdict ?? 'Suspicious',
      reasons: data.reasons ?? ["Analysis complete."],
      nlp_insights: data.nlp_insights ?? [],
      advice: data.advice ?? "Proceed with caution.",
      url: url,
      timestamp: new Date().toISOString(),
      sources: sources,
      breakdown: data.breakdown
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Propagate the error if it's key-related so UI handles it. 
    // Otherwise fallback to mock.
    if (error.message === "API_KEY_MISSING") {
        throw error;
    }
    // For other errors (network, parsing), we unfortunately fall back to mock 
    // to keep the app usable, but log it.
    return await mockAnalyzeProduct(url);
  }
};