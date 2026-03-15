"use client";
import { useState, useEffect } from "react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex items-end gap-3 px-4 py-3 border-t border-[var(--border-glass)] bg-[var(--bg-secondary)]">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={isMobile ? "Ask a CS question..." : "Ask a CS question... (Enter to send, Shift+Enter for new line)"}
        disabled={disabled}
        rows={1}
        className={[
          "flex-1 px-4 py-3 rounded-xl resize-none overflow-y-auto leading-relaxed text-[0.95rem]",
          "bg-[rgba(15,23,42,0.7)] border border-[var(--border-glass)] text-[var(--text-primary)]",
          "placeholder:text-[var(--text-muted)] font-[inherit]",
          "focus:outline-none focus:border-[var(--accent-blue)] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]",
          "transition-[border-color,box-shadow] duration-200",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
        style={{ maxHeight: 120 }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="px-5 py-3 rounded-xl text-white font-semibold text-sm whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:brightness-110 hover:enabled:-translate-y-0.5"
        style={{ background: "var(--gradient-primary)" }}
      >
        Send ↑
      </button>
    </div>
  );
}
