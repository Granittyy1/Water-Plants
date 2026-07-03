import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("photo") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No photo provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = file.type || "image/jpeg";

  const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: `Identify this plant. Return ONLY valid JSON with no markdown formatting: { "name": "common name", "species": "scientific name", "intervalDays": <number of days between watering> }`,
          },
          {
            inlineData: { mimeType, data: base64 },
          },
        ],
      },
    ],
  };

  const geminiRes = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    return NextResponse.json(
      { error: "Gemini API error", details: err },
      { status: 502 }
    );
  }

  const data = await geminiRes.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  try {
    const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
    const plantInfo = JSON.parse(cleaned);
    return NextResponse.json(plantInfo);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Gemini response", raw: text },
      { status: 500 }
    );
  }
}
