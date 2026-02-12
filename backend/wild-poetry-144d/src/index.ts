export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // CORS Fix
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
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      const body = await request.json();
      const url = body.url;

      if (!url) {
        return new Response(JSON.stringify({ error: "Missing url" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const systemInstruction = `
You are the TrustLens Forensic AI, an elite e-commerce fraud detection assistant.
You must analyze product URLs and detect scams.
Always return ONLY valid JSON.
`;

      const prompt = `
Analyze this product URL: ${url}

Return JSON only in this format:
{
  "trust_score": number,
  "verdict": "Genuine" | "Suspicious" | "Fake",
  "reasons": ["reason1","reason2"],
  "advice": "final advice",
  "breakdown": {
    "reviews": [],
    "sentiment": [],
    "price": [],
    "seller": [],
    "description": []
  }
}
`;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            generationConfig: {
              temperature: 0.1,
              topP: 0.9,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      const result = await geminiResponse.json();

      // Gemini text output
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return new Response(JSON.stringify({ error: "Gemini returned empty response", raw: result }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      return new Response(text, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || "Backend error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
