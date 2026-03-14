import { getEmbedding } from "./embeddings";
import { similaritySearch } from "./vectorStore";

export async function retrieveContext(query: string): Promise<string> {
  try {
    const queryEmbedding = await getEmbedding(query);
    const results = await similaritySearch(queryEmbedding, 5);
    if (!results.length) return "";

    return results
      .map((r, i) => `[Source: ${r.source}]\n${r.text}`)
      .join("\n\n---\n\n");
  } catch (err) {
    console.warn("RAG retrieval failed:", (err as Error).message);
    return "";
  }
}
