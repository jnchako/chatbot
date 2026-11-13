
import { ChromaClient } from "chromadb";
import { randomUUID } from "node:crypto";
import type { EmbeddedChunk } from "./embeddingService.js";

// Connect to the ChromaDB server running in Docker.
const client = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false,
});

// Name of the collection that stores our document chunks.
const COLLECTION_NAME = "rag_documents";

// Get the collection or create it if it does not exist.
async function getCollection() {
  return client.getOrCreateCollection({
    name: COLLECTION_NAME,
    configuration: {
      hnsw: {
        space: "cosine",
      },
    },
  });
}

// Save embedded document chunks to ChromaDB.
export async function addToVectorStore(
  chunks: EmbeddedChunk[]
): Promise<void> {
  if (chunks.length === 0) return;

  const collection = await getCollection();

  await collection.add({
    ids: chunks.map(() => randomUUID()),

    embeddings: chunks.map(
      (chunk) => chunk.embedding
    ),

    documents: chunks.map(
      (chunk) => chunk.content
    ),

    metadatas: chunks.map((chunk) => ({
      source: chunk.metadata.source,
      chunkIndex: chunk.metadata.chunkIndex,
    })),
  });

  console.log(`Saved ${chunks.length} chunks to ChromaDB.`);
}

// Retrieve the most relevant chunks for a question.
export async function searchVectorStore(
  queryEmbedding: number[],
  topK = 3
): Promise<EmbeddedChunk[]> {
  const collection = await getCollection();

  const count = await collection.count();

  if (count === 0) return [];

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: Math.min(topK, count),
    include: ["documents", "metadatas", "embeddings"],
  });

  const documents = results.documents[0] ?? [];
  const metadatas = results.metadatas[0] ?? [];
  const embeddings = results.embeddings?.[0] ?? [];

  return documents.flatMap((content, index) => {
    if (content === null) return [];

    const metadata = metadatas[index];

    return [{
      content,
      metadata: {
        source: String(metadata?.source ?? ""),
        chunkIndex: Number(metadata?.chunkIndex ?? 0),
      },
      embedding: Array.from(embeddings[index] ?? []),
    }];
  });
}
