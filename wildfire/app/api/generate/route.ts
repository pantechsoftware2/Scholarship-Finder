// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateWithBestModel } from "@/lib/geminiClient";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const answer = await generateWithBestModel(prompt);

    return NextResponse.json({ answer }, { status: 200 });
  } catch (err) {
    console.error("API /api/generate error", err);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
