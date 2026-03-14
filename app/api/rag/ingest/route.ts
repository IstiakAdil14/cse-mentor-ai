import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { ingestPDF, ingestText } from "@/app/lib/rag/ingest";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    const source = (formData.get("source") as string) || "manual";

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");

      if (isPDF) {
        const chunks = await ingestPDF(buffer, file.name);
        return Response.json({ success: true, chunks, source: file.name });
      }

      // Plain text file
      const content = buffer.toString("utf-8");
      const chunks = await ingestText(content, file.name);
      return Response.json({ success: true, chunks, source: file.name });
    }

    if (text) {
      const chunks = await ingestText(text, source);
      return Response.json({ success: true, chunks, source });
    }

    return Response.json({ error: "No file or text provided" }, { status: 400 });
  } catch (err) {
    console.error("Ingest error:", err);
    return Response.json({ error: "Ingestion failed" }, { status: 500 });
  }
}
