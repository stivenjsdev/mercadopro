import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

// consultas a la API de OpenAI
// POST /api/openai
export async function POST(request: NextRequest) {
  try {
    // create a OpenAI API client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
      await request.json();

    // make a request to the OpenAI API, recibe an output/completion
    const completion = await openai.chat.completions.create(body);

    // return the response from the API
    return NextResponse.json({
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
