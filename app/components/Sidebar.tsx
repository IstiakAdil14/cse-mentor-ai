"use client";
import { signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import RAGUpload from "./chat/RAGUpload";

interface Chat {
  _id: string;
  title: string;
  updatedAt: string;
}

export default function Sidebar() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const params = useParams();
  const activeChatId = params?.chatId as string | undefined;

  const loadChats = useCallback(async () => {
    const res = await fetch("/api/chats");
    if (res.ok) setChats(await res.json());
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const newChat = async () => {
    setCreating(true);
    const res = await fetch("/api/chats", { method: "POST" });
    if (res.ok) {
      const chat = await res.json();
      await loadChats();
      router.push(`/chat/${chat._id}`);
    }
    setCreating(false);
  };

  const deleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    await fetch(`/api/chats/${chatId}/messages`, { method: "DELETE" });
    const updated = chats.filter((c) => c._id !== chatId);
    setChats(updated);
    if (activeChatId === chatId) {
      if (updated.length > 0) router.push(`/chat/${updated[0]._id}`);
      else router.push("/chat");
    }
  };

  return (
    <div
      style={{
        width: 240,
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-glass)",
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
        gap: "0.5rem",
        height: "100%",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "1.4rem" }}>🎓</span>
        <span style={{ fontWeight: 700, fontSize: "0.95rem", background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          CSE Mentor AI
        </span>
      </div>

      {/* New Chat Button */}
      <button
        onClick={newChat}
        disabled={creating}
        style={{
          padding: "0.6rem 0.75rem",
          background: "var(--gradient-primary)",
          border: "none",
          borderRadius: "0.6rem",
          color: "white",
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: creating ? "not-allowed" : "pointer",
          opacity: creating ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "0.5rem",
        }}
      >
        <span style={{ fontSize: "1rem" }}>+</span>
        {creating ? "Creating..." : "New Chat"}
      </button>

      {/* Nav Links */}
      <a
        href="/profile"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "0.6rem",
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
          textDecoration: "none",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        <span>👤</span> Profile
      </a>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border-glass)", margin: "0.25rem 0" }} />

      {/* Chat History */}
      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 0.25rem" }}>
        Recent Chats
      </p>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
        {chats.length === 0 && (
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "0.5rem 0.25rem" }}>
            No chats yet. Start one!
          </p>
        )}
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => router.push(`/chat/${chat._id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.5rem 0.6rem",
              borderRadius: "0.5rem",
              cursor: "pointer",
              background: activeChatId === chat._id ? "rgba(59,130,246,0.15)" : "transparent",
              border: activeChatId === chat._id ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
              transition: "all 0.15s",
              gap: "0.4rem",
            }}
            onMouseEnter={(e) => { if (activeChatId !== chat._id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={(e) => { if (activeChatId !== chat._id) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: "0.82rem", color: activeChatId === chat._id ? "var(--text-primary)" : "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              💬 {chat.title}
            </span>
            <button
              onClick={(e) => deleteChat(e, chat._id)}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", padding: "0.1rem 0.2rem", borderRadius: "0.25rem", flexShrink: 0, opacity: 0.6 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "#fca5a5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.color = "var(--text-muted)"; }}
              title="Delete chat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* RAG Upload */}
      <RAGUpload />

      {/* Sign out */}
      <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-signout" style={{ width: "100%", marginTop: "0.25rem" }}>
        Sign Out
      </button>
    </div>
  );
}
