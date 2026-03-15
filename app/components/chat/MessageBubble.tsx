"use client";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

interface Props {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "0.75rem",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--gradient-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
            marginRight: "0.5rem",
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          🎓
        </div>
      )}

      <div
        style={{
          maxWidth: "min(75%, 100%)",
          minWidth: 0,
          overflow: "hidden",
          padding: "0.75rem 1rem",
          borderRadius: isUser ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.25rem",
          background: isUser
            ? "var(--gradient-primary)"
            : "rgba(17, 24, 39, 0.85)",
          border: isUser ? "none" : "1px solid var(--border-glass)",
          color: "var(--text-primary)",
          fontSize: "0.92rem",
          lineHeight: 1.6,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {isUser ? (
          <span>{content}</span>
        ) : (
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeStr = String(children).replace(/\n$/, "");
                if (match) {
                  return (
                    <CodeBlock language={match[1]} code={codeStr} />
                  );
                }
                return (
                  <code
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      padding: "0.15em 0.4em",
                      borderRadius: 4,
                      fontSize: "0.88em",
                      fontFamily: "monospace",
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p style={{ margin: "0.4rem 0" }}>{children}</p>;
              },
              ul({ children }) {
                return <ul style={{ paddingLeft: "1.25rem", margin: "0.4rem 0" }}>{children}</ul>;
              },
              ol({ children }) {
                return <ol style={{ paddingLeft: "1.25rem", margin: "0.4rem 0" }}>{children}</ol>;
              },
              h1({ children }) {
                return <h1 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0.6rem 0 0.3rem" }}>{children}</h1>;
              },
              h2({ children }) {
                return <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0.5rem 0 0.25rem" }}>{children}</h2>;
              },
              h3({ children }) {
                return <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0.4rem 0 0.2rem" }}>{children}</h3>;
              },
              blockquote({ children }) {
                return (
                  <blockquote
                    style={{
                      borderLeft: "3px solid var(--accent-blue)",
                      paddingLeft: "0.75rem",
                      margin: "0.5rem 0",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {children}
                  </blockquote>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative", margin: "0.5rem 0", borderRadius: "0.5rem", overflow: "hidden", maxWidth: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.35rem 0.75rem",
          background: "rgba(0,0,0,0.5)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
        }}
      >
        <span>{language}</span>
        <button
          onClick={copy}
          style={{
            background: "none",
            border: "none",
            color: copied ? "var(--accent-cyan)" : "var(--text-muted)",
            cursor: "pointer",
            fontSize: "0.75rem",
            padding: "0.1rem 0.4rem",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.85rem", overflowX: "auto", maxWidth: "100%" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
