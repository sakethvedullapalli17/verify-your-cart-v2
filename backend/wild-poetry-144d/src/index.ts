export default {
  async fetch(request: Request, env: any) {
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
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      const { url } = await request.json();

      if (!url) {
        return new Response(JSON.stringify({ error: "URL missing" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const systemInstruction = `
You are TrustLens AI, an expert fraud detection assistant.
Return ONLY valid JSON.
No markdown. No explanation.
trust_score must be 0-100.
verdict must be Genuine, Suspicious, or Fake.
`;

      const prompt = `
Analyze this product URL:
${url}

Return ONLY JSON:

{
  "trust_score": number,
  "verdict": "Genuine" | "Suspicious" | "Fake",
  "reasons": ["..."],
  "advice": "..."
}
`;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              topP: 0.9,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      const data = await geminiResponse.json();

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return new Response(
          JSON.stringify({ error: "No response from Gemini", raw: data }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // return parsed JSON directly
      const parsed = JSON.parse(text);

      return new Response(JSON.stringify(parsed), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message || "Internal error" }),
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
