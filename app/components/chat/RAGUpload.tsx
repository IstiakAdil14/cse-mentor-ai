"use client";
import { useState, useRef } from "react";

export default function RAGUpload() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/rag/ingest", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMessage(`✓ Ingested ${data.chunks} chunks from "${data.source}"`);
      } else {
        setStatus("error");
        setMessage(data.error ?? "Upload failed");
      }
    } catch {
      setStatus("error");
      setMessage("Upload failed");
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div
      style={{
        padding: "0.75rem",
        background: "rgba(59,130,246,0.05)",
        border: "1px solid rgba(59,130,246,0.15)",
        borderRadius: "0.75rem",
        marginTop: "auto",
      }}
    >
      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
        📚 Upload Study Material
      </p>
      <form onSubmit={upload} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md"
          style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
        />
        <button
          type="submit"
          disabled={status === "uploading"}
          style={{
            padding: "0.4rem 0.75rem",
            background: "var(--gradient-primary)",
            border: "none",
            borderRadius: "0.5rem",
            color: "white",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: status === "uploading" ? "not-allowed" : "pointer",
            opacity: status === "uploading" ? 0.6 : 1,
          }}
        >
          {status === "uploading" ? "Uploading..." : "Upload & Index"}
        </button>
      </form>
      {message && (
        <p
          style={{
            fontSize: "0.72rem",
            marginTop: "0.4rem",
            color: status === "done" ? "var(--accent-cyan)" : "#fca5a5",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
