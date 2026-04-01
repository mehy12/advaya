import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY is missing from environment variables." },
        { status: 500 }
      );
    }

    const { image, mimeType } = await req.json();

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the recommended model for vision tasks in v1.5
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert marine pollution analyst determining the nature of pollution from drone/phone photos.
      Examine the provided image for any signs of ocean/marine pollution.
      Respond strictly with a JSON object containing these precise keys and matching types. Do not use markdown blocks:
      {
        "is_pollution": boolean,
        "pollution_type": string (one of: "plastic", "oil", "sewage", "industrial", "ghost_gear", "agricultural", "shipping", "unknown"),
        "severity": number (1 to 5, where 5 is catastrophic ecological risk, 1 is minimal),
        "description": string (one short paragraph explaining exactly what is seen),
        "affected_area": string (estimated scale based on the view, e.g. "500m radius" or "local to vessel"),
        "recommended_action": string (one short sentence of tactical advice),
        "confidence": number (float between 0.0 and 1.0)
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,
          mimeType: mimeType || "image/jpeg",
        },
      },
    ]);

    const text = result.response.text();
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsedData;

    try {
      parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      console.error("Gemini failed to output valid JSON", text);
      return Response.json(
        { error: "Failed to parse AI response into structured format." },
        { status: 500 }
      );
    }

    return Response.json(parsedData);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return Response.json(
      { error: "Analysis failed", details: error.message },
      { status: 500 }
    );
  }
}
