"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useSidebar } from "@/app/lib/SidebarContext";
import type { QuestionLevel } from "@/app/utils/prompts";

type Message = { role: "user" | "assistant"; content: string };

interface Props {
  chatId: string;
  onTitleChange?: (title: string) => void;
}

// ── Question banks per level ───────────────────────────────────────────────────

const BASIC_QUESTIONS = [
  // Programming Basics
  "What is a variable and how do I use one in Python?",
  "What is an if-else statement? Explain with an example",
  "What is a loop? Explain for loops and while loops",
  "What is a function and why are functions useful?",
  "What is an array in programming?",
  "What is a string in programming?",
  "How do I read input and print output in Python?",
  "What is the difference between integers and floats?",

  // CS Fundamentals (beginner)
  "What is a computer program in simple terms?",
  "What is the difference between hardware and software?",
  "What is an operating system and what does it do?",
  "What is the CPU and what does it do?",
  "What is RAM vs storage?",
  "How does a computer store numbers?",
  "What is binary code?",
  "What is the internet in simple terms?",

  // Simple DSA
  "What is an algorithm in simple words?",
  "What is a data structure? Give some examples",
  "How do you sort a list of numbers?",
  "What is linear search vs binary search?",
  "What is a stack? Explain with a real-life example",
  "What is a queue? Explain with a real-life example",
  "What is a linked list in simple terms?",
  "What is recursion in simple terms?",
];

const INTERMEDIATE_QUESTIONS = [
  // Algorithms
  "Explain Big O notation with examples",
  "What is the difference between BFS and DFS?",
  "How does Dijkstra's algorithm work?",
  "Explain merge sort with code in Python",
  "What is dynamic programming? Give an example",
  "How does quicksort work and what is its time complexity?",
  "Explain the knapsack problem",
  "What is a greedy algorithm? When should I use it?",
  "How does binary search work?",
  "Explain the sliding window technique",
  "What is memoization vs tabulation?",
  "How does A* search algorithm work?",
  "Explain topological sorting",
  "What is the two-pointer technique?",
  "How do you detect a cycle in a linked list?",

  // Data Structures
  "How does a hash table work internally?",
  "What is the difference between a stack and a queue?",
  "Explain how a binary search tree works",
  "What is a heap and when do you use it?",
  "How does a trie data structure work?",
  "What is the difference between an array and a linked list?",
  "Explain AVL trees and self-balancing",
  "What is a graph and how is it represented?",
  "How does a priority queue work?",
  "What is a segment tree used for?",

  // Programming Concepts
  "What is recursion? Explain with an example",
  "What is the difference between OOP and functional programming?",
  "Explain SOLID principles in software design",
  "What is a closure in JavaScript?",
  "How does garbage collection work?",
  "What is the difference between concurrency and parallelism?",
  "Explain REST vs GraphQL",
  "What are design patterns? Name a few",
  "What is dependency injection?",
  "Explain the MVC architecture pattern",
];

const STANDARD_QUESTIONS = [
  // Systems & OS
  "What is a deadlock and how do you prevent it?",
  "Explain virtual memory and paging",
  "What is the difference between a process and a thread?",
  "How does CPU scheduling work?",
  "What is a race condition?",
  "Explain how TCP/IP works",
  "What is the difference between HTTP and HTTPS?",
  "How does DNS resolution work?",
  "What is a mutex vs semaphore?",
  "Explain cache memory and locality of reference",

  // Databases
  "What is the difference between SQL and NoSQL?",
  "Explain database normalization",
  "What are ACID properties in databases?",
  "How does indexing improve query performance?",
  "What is a JOIN in SQL? Explain types",
  "What is database sharding?",
  "Explain CAP theorem",
  "What is an ORM and how does it work?",
  "What is a transaction in a database?",
  "How does MongoDB store data differently from MySQL?",

  // Web & Networking
  "How does the browser render a webpage?",
  "What is CORS and why does it exist?",
  "Explain how OAuth 2.0 works",
  "What is WebSocket and when to use it?",
  "How does JWT authentication work?",
  "What is the event loop in JavaScript?",
  "Explain async/await vs promises",
  "What is server-side rendering vs client-side rendering?",
  "How does a CDN work?",
  "What is load balancing?",

  // CS Theory
  "What is the P vs NP problem?",
  "Explain Turing completeness",
  "What is a finite state machine?",
  "Explain the halting problem",
  "What is time complexity vs space complexity?",
  "What are NP-hard problems?",
  "Explain Boolean algebra basics",
  "What is a regular expression and how does it work?",
  "What is the difference between compiled and interpreted languages?",
  "Explain how a compiler works",
];

const QUESTIONS_BY_LEVEL: Record<QuestionLevel, string[]> = {
  basic: BASIC_QUESTIONS,
  intermediate: INTERMEDIATE_QUESTIONS,
  standard: STANDARD_QUESTIONS,
};

const LEVEL_META: Record<
  QuestionLevel,
  { label: string; icon: string; description: string; color: string; activeBg: string; activeBorder: string }
> = {
  basic: {
    label: "Basic",
    icon: "🌱",
    description: "Beginner-friendly",
    color: "var(--accent-cyan)",
    activeBg: "rgba(6,182,212,0.12)",
    activeBorder: "rgba(6,182,212,0.45)",
  },
  intermediate: {
    label: "Intermediate",
    icon: "📘",
    description: "Core fundamentals",
    color: "var(--accent-blue)",
    activeBg: "rgba(59,130,246,0.12)",
    activeBorder: "rgba(59,130,246,0.45)",
  },
  standard: {
    label: "Standard",
    icon: "🎯",
    description: "Interview prep",
    color: "var(--accent-purple)",
    activeBg: "rgba(139,92,246,0.12)",
    activeBorder: "rgba(139,92,246,0.45)",
  },
};

const LEVEL_ORDER: QuestionLevel[] = ["basic", "intermediate", "standard"];

const CATEGORY_COLORS = [
  { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", color: "var(--accent-blue)" },
  { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", color: "var(--accent-purple)" },
  { bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)", color: "var(--accent-cyan)" },
  { bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.25)", color: "var(--accent-pink)" },
];

function getRandomQuestions(level: QuestionLevel, count: number): string[] {
  const pool = QUESTIONS_BY_LEVEL[level];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function ChatWindow({ chatId, onTitleChange }: Props) {
  const { openSidebar } = useSidebar();
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] ?? "there";
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(true);
  const [level, setLevel] = useState<QuestionLevel>("intermediate");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const current = el.scrollTop;
    setNavVisible(current < lastScrollY.current || current < 60);
    lastScrollY.current = current;
  }, []);

  // Pick 8 random questions for the selected level
  const suggestions = useMemo(() => getRandomQuestions(level, 8), [chatId, level]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetch(`/api/chats/${chatId}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(
            data.map((m: { role: "user" | "assistant"; content: string }) => ({
              role: m.role,
              content: m.content,
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleLevelChange = (newLevel: QuestionLevel) => {
    setLevel(newLevel);
    setError("");
  };

  const sendMessage = async (content: string) => {
    setError("");
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setIsTyping(true);
    onTitleChange?.(content.slice(0, 60));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, chatId, level }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(data.error);
        setIsTyping(false);
        return;
      }

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let reply = "";

      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reply += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: reply };
            return updated;
          });
        }
      }
    } catch {
      setIsTyping(false);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-primary)" }}>

      {/* Navbar — always on desktop, hide-on-scroll-down on mobile */}
      <div
        className={[
          "flex items-center justify-between px-4 py-3 border-b border-[var(--border-glass)]",
          "bg-[var(--bg-secondary)]/80 backdrop-blur-md",
          "transition-transform duration-300 ease-in-out",
          "md:translate-y-0",
          navVisible ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
        style={{ position: "sticky", top: 0, zIndex: 10 }}
      >
        {/* Left: hamburger (mobile) + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={openSidebar}
            className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-lg border border-[var(--border-glass)] hover:bg-white/5 transition-colors"
            aria-label="Open sidebar"
          >
            <span className="block w-5 h-0.5 bg-[var(--text-secondary)]" />
            <span className="block w-5 h-0.5 bg-[var(--text-secondary)]" />
            <span className="block w-5 h-0.5 bg-[var(--text-secondary)]" />
          </button>
          <span
            className="font-bold text-sm"
            style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            🎓 CSE Mentor AI
          </span>
        </div>

        {/* Right: message count pill */}
        {messages.length > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-[var(--border-glass)] text-[var(--text-muted)]">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
      >

        {loading && (
          <div style={{ textAlign: "center", marginTop: "4rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
            Loading messages...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: "2rem" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎓</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                What do you want to learn today, {userName}?
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Pick a question below or type your own
              </p>
            </div>

            {/* Level Selector */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <div
                role="tablist"
                aria-label="Question level"
                style={{
                  display: "inline-flex",
                  gap: "0.35rem",
                  padding: "0.3rem",
                  background: "rgba(15,23,42,0.6)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "0.85rem",
                }}
              >
                {LEVEL_ORDER.map((lvl) => {
                  const meta = LEVEL_META[lvl];
                  const active = level === lvl;
                  return (
                    <button
                      key={lvl}
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleLevelChange(lvl)}
                      title={meta.description}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        padding: "0.5rem 0.9rem",
                        borderRadius: "0.6rem",
                        fontSize: "0.8rem",
                        fontWeight: active ? 700 : 500,
                        color: active ? meta.color : "var(--text-muted)",
                        background: active ? meta.activeBg : "transparent",
                        border: `1px solid ${active ? meta.activeBorder : "transparent"}`,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
              {suggestions.map((q, i) => {
                const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                return (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      padding: "0.85rem 1rem",
                      background: color.bg,
                      border: `1px solid ${color.border}`,
                      borderRadius: "0.75rem",
                      color: "var(--text-primary)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      textAlign: "left",
                      lineHeight: 1.5,
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.6rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 4px 16px ${color.border}`;
                      e.currentTarget.style.borderColor = color.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = color.border;
                    }}
                  >
                    <span style={{ color: color.color, fontSize: "1rem", flexShrink: 0, marginTop: "0.05rem" }}>→</span>
                    <span>{q}</span>
                  </button>
                );
              })}
            </div>

            {/* Refresh hint */}
            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1.25rem" }}>
              💡 Questions change every new chat · {QUESTIONS_BY_LEVEL[level].length} {LEVEL_META[level].label.toLowerCase()} topics available
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={idx} role={msg.role} content={msg.content} />
        ))}

        {isTyping && <TypingIndicator />}

        {error && (
          <div className="error-alert" style={{ maxWidth: 500, margin: "0.5rem 0" }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={sendMessage} disabled={isTyping || loading} />
    </div>
  );
}