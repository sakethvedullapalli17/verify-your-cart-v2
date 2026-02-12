export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return new Response("Backend working. Use POST request.", {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      const { url } = await request.json();

      if (!url) {
        return new Response(JSON.stringify({ error: "Product URL missing" }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      const systemInstruction = `
You are the TrustLens Forensic AI, an elite specialist in e-commerce fraud detection.
You use linguistic footprinting, pricing forensics, and seller reputation grounding.
Always respond with VALID JSON only.
`;

      const prompt = `
Perform a deep forensic scan on this product URL: ${url}

Steps:
1. Grounding search (use web knowledge).
2. Linguistic review analysis.
3. Price realism check.
4. Seller reputation & domain age.

Return JSON ONLY:
{
  "trust_score": number,
  "verdict": "Genuine" | "Suspicious" | "Fake",
  "reasons": string[],
  "advice": string
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
            },
          }),
        }
      );

      const data = await geminiResponse.json();

      return new Response(JSON.stringify(data), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: "Backend error", details: err.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};
