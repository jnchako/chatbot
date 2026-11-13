import { ChatOpenAI } from "@langchain/openai";
import type { EmbeddedChunk } from "./embeddingService.js";

const model = new ChatOpenAI({
  model: "gpt-5-mini",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAnswer(
  question: string,
  chunks: EmbeddedChunk[]
): Promise<string> {
  const context = chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}: ${chunk.metadata.source}]\n${chunk.content}`
    )
    .join("\n\n");

  const prompt = `
You are a document question-answering assistant.

Answer the user's question using only the document context provided below.

Rules:
- Do not use outside knowledge.
- If the answer cannot be found in the context, say:
  "I couldn't find that information in the uploaded documents."
- Keep the answer clear and concise.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${question}
`;

  const response = await model.invoke(prompt);

  return typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);
}