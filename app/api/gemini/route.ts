import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// instance Gemini AI server-side
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Tambahan instruksi supaya AI tahu namanya Pips
    const systemPrompt = `
    Kamu adalah Pips, AI assistant yang ramah dan membantu.
    Selalu perkenalkan dirimu sebagai Pips ketika menjawab pertanyaan.
    `;

    const finalPrompt = `${systemPrompt}\n\nUser: ${prompt}`;

    // Pastikan model valid (sesuai listModels)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(finalPrompt);

    // ambil text response
    const text = (await result.response).text();

    return NextResponse.json({ success: true, data: text });
  } catch (err: any) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
