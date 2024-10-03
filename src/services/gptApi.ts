import { OpenAI } from "openai";

export const gptQuery = async (
  body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
): Promise<{ message: string }> => {
  const response = await fetch("/api/openai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Something went wrong");
  }

  const data = await response.json();
  return { message: data.message };
};
