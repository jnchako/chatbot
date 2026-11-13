import fs from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFParse } from "pdf-parse";

export type DocumentChunk = {
  content: string;

  metadata: {
    source: string;
    chunkIndex: number;
  };
};

export async function readTextFile(
  filePath: string
): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}

export async function readPdfFile(
  filePath: string
): Promise<string> {
  const buffer = await fs.readFile(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    return result.text;
  } finally {
    await parser.destroy();
  }
}

export async function chunkText(
  text: string,
  source: string
): Promise<DocumentChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const documents = await splitter.createDocuments(
    [text],
    [{ source }]
  );

  return documents.map((document, index) => ({
    content: document.pageContent,

    metadata: {
      source,
      chunkIndex: index,
    },
  }));
}

export async function processTextDocument(
  file: Express.Multer.File
): Promise<DocumentChunk[]> {
  const text = await readTextFile(file.path);

  const chunks = await chunkText(
    text,
    file.originalname
  );

  return chunks;
}

export async function processPdfDocument(
  file: Express.Multer.File
): Promise<DocumentChunk[]> {
  const text = await readPdfFile(file.path);

  const chunks = await chunkText(
    text,
    file.originalname
  );

  return chunks;
}