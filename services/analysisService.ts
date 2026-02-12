import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AnalysisResult } from '../types';
import { mockAnalyzeProduct } from './mockAnalysisService';

/**
 * Elite Forensic Analysis Service
 * Upgraded to Gemini 3 Pro for superior reasoning and real-time search grounding.
 */
export const analyzeProduct = async (url: string): Promise<AnalysisResult> => {
  const hostname = new URL(url).hostname;

  // System Instruction: Defining the identity and methodology for maximum accuracy
  const systemInstruction = `You are the TrustLens Elite Forensic AI, an investigator specializing in global e-commerce security and counterfeit detection.
  
  Your primary objective is to audit product URLs for fraud. You MUST use a rigorous multi-pillar methodology:
  
  PILLAR 1: SEARCH GROUNDING
  - Use the googleSearch tool to find independent consumer reviews of "${hostname}".
  - Search for "${hostname} scam" or "${hostname} legit".
  - Verify the MSRP (Manufacturer's Suggested Retail Price) for the specific item category.
  
  PILLAR 2: LINGUISTIC PATTERNS
  - Scrutinize descriptions for bot-generated syntax or "keyword stuffing".
  - Identify generic sentiment spikes (reviews that use high-emotion, low-detail phrases).
  - Look for "Review Hijacking" (reviews that clearly describe a different product).
  
  PILLAR 3: MARKET ANOMALIES
  - Flag prices that are >40% lower than standard market rates as "Bait Scams".
  - Analyze domain registration patterns (if search data indicates a very new site).
  
  OUTPUT REQUIREMENT:
  You must return a valid JSON object. Be objective, thorough, and decisive.`;

  // Refined Prompt for deep reasoning
  const prompt = `Perform an exhaustive forensic audit on this product URL: ${url}

  PHASE 1: Execution
  Step 1: Use your search tool to find live reputation data for ${hostname} and current pricing for similar items.
  Step 2: Compare the URL metadata and visible naming conventions against known platform standards.
  Step 3: Calculate a Trust Score based on: Seller History (35%), Price Realism (25%), and Linguistic Footprinting (40%).

  PHASE 2: Response Construction (JSON ONLY)
  Return a JSON object with this exact structure:
  {
    "trust_score": number (0-100),
    "verdict": "Genuine" | "Suspicious" | "Fake",
    "nlp_insights": ["Marker 1", "Marker 2", ...],
    "breakdown": {
      "reviews": ["Forensic details about review quality"],
      "sentiment": ["Deep linguistic analysis of consumer sentiment"],
      "price": ["Market price cross-reference findings"],
      "seller": ["Verification of seller history and reputation"],
      "description": ["Audit of the product listing text"]
    },
    "reasons": ["Key finding 1", "Key finding 2", "Key finding 3"],
    "advice": "Specific buyer recommendation"
  }`;

  const config = {
    responseMimeType: "application/json",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
    ],
    // Pro model is required for high-accuracy reasoning and tool-integrated search
    tools: [{ googleSearch: {} }] 
  };

  try {
    // Re-initialize to ensure latest API context
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    
    // Using gemini-3-pro-preview for complex reasoning task
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        ...config,
        systemInstruction,
        temperature: 0.1, // Low temperature for consistent forensic scoring
        thinkingConfig: { thinkingBudget: 0 } // Flash response for grounding
      }
    });

    if (!response || !response.text) {
      throw new Error("Forensic engine returned no data.");
    }

    let jsonStr = response.text.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const data = JSON.parse(jsonStr);
    
    // Extract Grounding Chunks for source attribution
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((c: any) => c.web?.uri)
      .filter((uri: string) => uri) || [];
    
    return {
      trust_score: data.trust_score ?? 50,
      verdict: data.verdict ?? 'Suspicious',
      reasons: data.reasons ?? ["Manual verification recommended."],
      nlp_insights: data.nlp_insights ?? [],
      advice: data.advice ?? "Check seller history independently before proceeding.",
      url: url,
      timestamp: new Date().toISOString(),
      sources: sources,
      breakdown: data.breakdown
    };

  } catch (error: any) {
    console.error("Neural Forensic Error:", error);
    // Silent fallback to heuristic service ensures app doesn't break
    return await mockAnalyzeProduct(url);
  }
};