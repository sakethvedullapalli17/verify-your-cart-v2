import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AnalysisResult } from '../types';
import { mockAnalyzeProduct } from './mockAnalysisService';

/**
 * Advanced Analysis Service (Frontend Only)
 * Uses Gemini models with Google Search Grounding to verify products in real-time.
 */
export const analyzeProduct = async (url: string): Promise<AnalysisResult> => {
  // 1. Securely access API key from build environment
  const apiKey = process.env.API_KEY || "";
  
  if (!apiKey || apiKey === "PLACEHOLDER_API_KEY" || apiKey.trim() === "") {
    console.warn("No API Key found. Using mock service.");
    return await mockAnalyzeProduct(url);
  }

  const hostname = new URL(url).hostname;

  // 2. System Instruction: Define the persona and rules
  const systemInstruction = `You are TrustLens AI, an elite e-commerce fraud detector.
  
  YOUR GOAL: Verify the legitimacy of a product URL by cross-referencing it with live search data.
  
  ANALYSIS STEPS:
  1. SEARCH VALIDATION: Use Google Search to check if this product/seller exists on reputable sites.
  2. PRICE CHECK: Compare the listed price with the market average found via search.
  3. REPUTATION SCAN: Look for "scam" or "fake" reports associated with the domain.
  4. SENTIMENT ANALYSIS: Analyze the phrasing of the title and description for bot-like patterns.
  
  OUTPUT FORMAT:
  Return purely valid JSON. Do not include markdown formatting like \`\`\`json.`;

  // 3. Prompt: explicit context
  const prompt = `Analyze this URL: ${url}
  
  Platform: ${hostname}
  
  Return a JSON object with this exact schema:
  {
    "trust_score": number (0-100),
    "verdict": "Genuine" | "Suspicious" | "Fake",
    "nlp_insights": ["Specific observation about text/grammar", "Observation about seller"],
    "breakdown": {
      "reviews": ["Insight about reviews"],
      "sentiment": ["Insight about sentiment"],
      "price": ["Insight about pricing logic"],
      "seller": ["Insight about seller identity"],
      "description": ["Insight about product description"]
    },
    "reasons": ["Major reason 1", "Major reason 2", "Major reason 3"],
    "advice": "Clear, actionable advice for the buyer."
  }`;

  const config = {
    responseMimeType: "application/json",
    // Schema helps guide the model, though search tools sometimes override strict JSON mode
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        trust_score: { type: Type.NUMBER },
        verdict: { type: Type.STRING },
        nlp_insights: { type: Type.ARRAY, items: { type: Type.STRING } },
        breakdown: {
          type: Type.OBJECT,
          properties: {
            reviews: { type: Type.ARRAY, items: { type: Type.STRING } },
            sentiment: { type: Type.ARRAY, items: { type: Type.STRING } },
            price: { type: Type.ARRAY, items: { type: Type.STRING } },
            seller: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["reviews", "sentiment", "price", "seller", "description"]
        },
        reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
        advice: { type: Type.STRING }
      },
      required: ["trust_score", "verdict", "breakdown", "reasons", "advice", "nlp_insights"]
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
    ],
    // Enable Search Tool for grounding (Real-time data)
    tools: [{ googleSearch: {} }] 
  };

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-3-flash-preview for speed + search capabilities
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: config as any
    });

    if (!response || !response.text) {
        throw new Error("Empty response from Gemini");
    }

    // Clean up response if model adds markdown blocks
    let jsonStr = response.text.trim();
    if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const data = JSON.parse(jsonStr);
    
    // Extract Grounding Metadata (Sources found by Google Search)
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
      sources: sources, // Pass search sources to UI
      breakdown: data.breakdown
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Graceful fallback if API fails
    return await mockAnalyzeProduct(url);
  }
};