import { Pinecone } from "@pinecone-database/pinecone";

const INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "cse-mentor";

function getIndex() {
  const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  return client.index(INDEX_NAME);
}

export async function upsertVectors(
  vectors: { id: string; values: number[]; metadata: Record<string, string> }[]
) {
  const index = getIndex();
  await index.upsert({ records: vectors } as Parameters<typeof index.upsert>[0]);
}

export async function similaritySearch(
  queryVector: number[],
  topK = 5
): Promise<{ text: string; source: string }[]> {
  const index = getIndex();
  const result = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  return (result.matches ?? [])
    .filter((m) => m.score && m.score > 0.5)
    .map((m) => ({
      text: (m.metadata?.text as string) ?? "",
      source: (m.metadata?.source as string) ?? "unknown",
    }));
}
