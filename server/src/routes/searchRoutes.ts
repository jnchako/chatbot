import express from "express";
import { embedQuery } from "../services/embeddingService.js";
import { searchVectorStore } from "../services/vectorStoreService.js";
import { generateAnswer } from "../services/chatService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { query } = req.body;

    if (
      !query ||
      typeof query !== "string" ||
      query.trim().length === 0
    ) {
      return res.status(400).json({
        message: "A search query is required.",
      });
    }

    // Turn the user's question into an embedding
    const queryEmbedding = await embedQuery(query);

    // Find the 3 most relevant document chunks
    const results = await searchVectorStore(
      queryEmbedding,
      3
    );

    // Give the question + relevant chunks to the LLM
    const answer = await generateAnswer(
      query,
      results
    );

    // Send the final answer and sources back to React
    res.json({
      query,
      answer,

      sources: results.map((chunk) => ({
        source: chunk.metadata.source,
        chunkIndex: chunk.metadata.chunkIndex,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);

    res.status(500).json({
      message: "Failed to answer question.",
    });
  }
});

export default router;