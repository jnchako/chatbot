import express from "express";
import multer from "multer";
import {
  processTextDocument,
  processPdfDocument,
  type DocumentChunk,
} from "../services/documentService.js";
import { embedChunks } from "../services/embeddingService.js";
import { addToVectorStore } from "../services/vectorStoreService.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, TXT, and Markdown files are allowed."));
    }
  },
});

router.post(
  "/",
  upload.array("documents", 10),
  async (req, res) => {
    try {
      const files =
        req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          message: "No documents were uploaded.",
        });
      }

      const allChunks: DocumentChunk[] = [];

      for (const file of files) {
        let chunks: DocumentChunk[] = [];

        if (file.mimetype === "text/plain") {
          chunks = await processTextDocument(file);
        } else if (file.mimetype === "application/pdf") {
          chunks = await processPdfDocument(file);
        }

        allChunks.push(...chunks);
      }

      console.log(
  `Created ${allChunks.length} document chunks.`
);

const embeddedChunks = await embedChunks(allChunks);

await addToVectorStore(embeddedChunks);

console.log(
  `Created ${embeddedChunks.length} embeddings.`
);

if (embeddedChunks.length > 0) {
  console.log(
    "First embedding dimensions:",
    embeddedChunks[0].embedding.length
  );

  console.log(
    "First 10 values:",
    embeddedChunks[0].embedding.slice(0, 10)
  );
}

      res.json({
        message:
          "Documents uploaded and processed successfully!",

        files: files.map((file) => ({
          originalName: file.originalname,
          size: file.size,
          type: file.mimetype,
        })),

        chunkCount: allChunks.length,
        embeddingCount: embeddedChunks.length,
      });
    } catch (error) {
      console.error(
        "Document processing error:",
        error
      );

      res.status(500).json({
        message: "Failed to process documents.",
      });
    }
  }
);

export default router;