import { OpenAIEmbeddings } from "@langchain/openai";
import type { DocumentChunk } from "./documentService.js";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

export type EmbeddedChunk = {
  content: string;

  metadata: {
    source: string;
    chunkIndex: number;
  };

  embedding: number[];
};

export async function embedChunks(
  chunks: DocumentChunk[]
): Promise<EmbeddedChunk[]> {
  const texts = chunks.map((chunk) => chunk.content);

  const vectors = await embeddings.embedDocuments(texts);

  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: vectors[index],
  }));
}

export async function embedQuery(
  query: string
): Promise<number[]> {
  return embeddings.embedQuery(query);
}