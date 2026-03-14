"use client";
import { useState } from "react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        borderTop: "1px solid var(--border-glass)",
        background: "var(--bg-secondary)",
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-end",
      }}
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask a CS question... (Enter to send, Shift+Enter for new line)"
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          padding: "0.75rem 1rem",
          background: "rgba(15, 23, 42, 0.7)",
          border: "1px solid var(--border-glass)",
          borderRadius: "0.75rem",
          color: "var(--text-primary)",
          fontSize: "0.95rem",
          fontFamily: "inherit",
          outline: "none",
          resize: "none",
          lineHeight: 1.5,
          maxHeight: 120,
          overflowY: "auto",
          opacity: disabled ? 0.5 : 1,
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        style={{
          padding: "0.75rem 1.25rem",
          background: "var(--gradient-primary)",
          border: "none",
          borderRadius: "0.75rem",
          color: "white",
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: disabled || !input.trim() ? "not-allowed" : "pointer",
          opacity: disabled || !input.trim() ? 0.5 : 1,
          transition: "all 0.2s ease",
          whiteSpace: "nowrap",
        }}
      >
        Send ↑
      </button>
    </div>
  );
}
