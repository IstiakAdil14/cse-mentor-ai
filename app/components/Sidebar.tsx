"use client";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import RAGUpload from "./chat/RAGUpload";
import AuthLoader from "./AuthLoader";

interface Chat {
  _id: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [creating, setCreating] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const params = useParams();
  const activeChatId = params?.chatId as string | undefined;
  const { status } = useSession();

  const loadChats = useCallback(async (retries = 3): Promise<void> => {
    const res = await fetch("/api/chats");
    if (res.ok) {
      setChats(await res.json());
    } else if (res.status === 401 && retries > 0) {
      await new Promise((r) => setTimeout(r, 500));
      return loadChats(retries - 1);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") loadChats();
  }, [status, loadChats]);

  const newChat = async () => {
    setCreating(true);
    const res = await fetch("/api/chats", { method: "POST" });
    if (res.ok) {
      const chat = await res.json();
      await loadChats();
      router.push(`/chat/${chat._id}`);
      onClose();
    }
    setCreating(false);
  };

  const deleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    await fetch(`/api/chats/${chatId}/messages`, { method: "DELETE" });
    const updated = chats.filter((c) => c._id !== chatId);
    setChats(updated);
    if (activeChatId === chatId) {
      router.push(updated.length > 0 ? `/chat/${updated[0]._id}` : "/chat");
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {signingOut && <AuthLoader message="Signing out..." subtext="See you soon" emoji="👋" />}

      <aside
        className={[
          // Base
          "fixed md:relative inset-y-0 left-0 z-30",
          "w-60 flex flex-col gap-2 p-4 h-full flex-shrink-0",
          "bg-[var(--bg-secondary)] border-r border-[var(--border-glass)]",
          // Slide transition on mobile
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Close sidebar"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎓</span>
          <span
            className="font-bold text-sm"
            style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            CSE Mentor AI
          </span>
        </div>

        {/* New Chat */}
        <button
          onClick={newChat}
          disabled={creating}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-semibold mb-1 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--gradient-primary)" }}
        >
          <span className="text-base">+</span>
          {creating ? "Creating..." : "New Chat"}
        </button>

        {/* Profile link */}
        <a
          href="/profile"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
        >
          <span>👤</span> Profile
        </a>

        {/* Divider */}
        <div className="h-px bg-[var(--border-glass)] my-1" />

        {/* Recent Chats label */}
        <p className="text-[0.7rem] text-[var(--text-muted)] font-semibold uppercase tracking-widest px-1">
          Recent Chats
        </p>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
          {chats.length === 0 && (
            <p className="text-xs text-[var(--text-muted)] px-1 py-2">No chats yet. Start one!</p>
          )}
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => { router.push(`/chat/${chat._id}`); onClose(); }}
              className={[
                "flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all gap-1.5 border",
                activeChatId === chat._id
                  ? "bg-blue-500/15 border-blue-500/25"
                  : "border-transparent hover:bg-white/[0.04]",
              ].join(" ")}
            >
              <span
                className={[
                  "text-[0.82rem] truncate flex-1",
                  activeChatId === chat._id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
                ].join(" ")}
              >
                💬 {chat.title}
              </span>
              <button
                onClick={(e) => deleteChat(e, chat._id)}
                className="text-[var(--text-muted)] hover:text-red-300 text-xs px-1 py-0.5 rounded opacity-60 hover:opacity-100 transition-all flex-shrink-0"
                title="Delete chat"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <RAGUpload />

        <button onClick={handleSignOut} className="btn-signout w-full mt-1">
          Sign Out
        </button>
      </aside>
    </>
  );
}
