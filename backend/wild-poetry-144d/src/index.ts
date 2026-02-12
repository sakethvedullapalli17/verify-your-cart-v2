export default {
  async fetch(request: Request, env: any) {
    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Backend working. Use POST request.", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      const body = await request.json();
      const url = body?.url;

      if (!url) {
        return new Response(
          JSON.stringify({ error: "URL missing" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      const systemInstruction = `
You are TrustLens AI, an elite forensic fraud detection assistant.

You must analyze e-commerce product links and detect scam or fake products.

RULES:
- Always return VALID JSON only.
- No markdown.
- No explanations outside JSON.
- trust_score must be between 0 and 100.
- verdict must be exactly one of: "Genuine", "Suspicious", "Fake"
- reasons must be short bullet style strings.
- advice must be clear and actionable.
`;

      const prompt = `
Analyze this product URL deeply:
${url}

Return JSON in this exact format:

{
  "trust_score": number,
  "verdict": "Genuine" | "Suspicious" | "Fake",
  "reasons": [
    "reason1",
    "reason2",
    "reason3"
  ],
  "advice": "string",
  "breakdown": {
    "price_check": number,
    "seller_reputation": number,
    "review_authenticity": number,
    "website_authenticity": number
  }
}

IMPORTANT:
- Keep breakdown scores between 0 and 100.
- trust_score should be average of breakdown values.
- If URL looks like official brand website (Dell, Apple, Amazon), score higher.
- If URL is unknown or suspicious, score lower.
`;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              topP: 0.9,
              maxOutputTokens: 700,
            },
          }),
        }
      );

      const data = await geminiResponse.json();

      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message || "Internal Error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
