import { getEmbeddingsBatch } from "./embeddings";
import { upsertVectors } from "./vectorStore";
import crypto from "crypto";

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

function chunkText(text: string): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    chunks.push(words.slice(i, i + CHUNK_SIZE).join(" "));
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.trim().length > 50);
}

export async function ingestPDF(buffer: Buffer, filename: string): Promise<number> {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule.default ?? pdfParseModule) as unknown as (buffer: Buffer) => Promise<{ text: string }>;
  const { text } = await pdfParse(buffer);
  const chunks = chunkText(text);

  const BATCH = 20;
  let total = 0;

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const embeddings = await getEmbeddingsBatch(batch);
    const vectors = batch.map((chunk, j) => ({
      id: crypto.createHash("md5").update(`${filename}-${i + j}`).digest("hex"),
      values: embeddings[j],
      metadata: { text: chunk, source: filename },
    }));
    await upsertVectors(vectors);
    total += batch.length;
  }

  return total;
}

export async function ingestText(text: string, source: string): Promise<number> {
  const chunks = chunkText(text);
  const BATCH = 20;
  let total = 0;

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const embeddings = await getEmbeddingsBatch(batch);
    const vectors = batch.map((chunk, j) => ({
      id: crypto.createHash("md5").update(`${source}-${i + j}`).digest("hex"),
      values: embeddings[j],
      metadata: { text: chunk, source },
    }));
    await upsertVectors(vectors);
    total += batch.length;
  }

  return total;
}
