import type { NextApiRequest, NextApiResponse } from "next";

// ✅ Replace this import with your real FX engine when ready
// import { generate_gpt_reasoning } from "../../core/fx_reasoning_engine";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Invalid query format" });
    }

    // ✅ TEMPORARY MOCKED RESPONSE for testing terminal
    const result = {
      pair: query,
      label: "bullish",
      edge_score: 78,
      summary: `Morfeus detects a bullish bias for ${query} with strong macro alignment.`,
    };

    // ✅ UNCOMMENT THIS when you're ready to use the real agent
    // const result = await generate_gpt_reasoning(query.trim().toUpperCase());

    return res.status(200).json(result);
  } catch (error) {
    console.error("Morfeus API Error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

