import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "@/app/utils/prompts";

export type Message = { role: "user" | "assistant" | "system"; content: string };

// ── Streaming helpers ──────────────────────────────────────────────────────────

function textToStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      // Simulate token-by-token streaming for cached/non-streaming providers
      const words = text.split(" ");
      let i = 0;
      const push = () => {
        if (i >= words.length) { controller.close(); return; }
        controller.enqueue(encoder.encode((i === 0 ? "" : " ") + words[i++]));
        setTimeout(push, 10);
      };
      push();
    },
  });
}

// ── Provider: Gemini (streaming) ───────────────────────────────────────────────

async function streamGemini(messages: Message[]): Promise<ReadableStream<Uint8Array>> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const userMessages = messages.filter((m) => m.role !== "system");
  const lastMessage = userMessages.at(-1)?.content ?? "";
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });
  const history = userMessages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage);

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });
}

// ── Provider: OpenRouter (streaming) ──────────────────────────────────────────

async function streamOpenRouter(messages: Message[]): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages,
      stream: true,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);

  const encoder = new TextEncoder();
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") { controller.close(); return; }
          try {
            const json = JSON.parse(data);
            const token = json.choices?.[0]?.delta?.content;
            if (token) controller.enqueue(encoder.encode(token));
          } catch {}
        }
      }
      controller.close();
    },
  });
}

// ── Provider: Groq (streaming) ────────────────────────────────────────────────

async function streamGroq(messages: Message[]): Promise<ReadableStream<Uint8Array>> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const stream = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content;
        if (token) controller.enqueue(encoder.encode(token));
      }
      controller.close();
    },
  });
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function streamResponse(messages: Message[]): Promise<ReadableStream<Uint8Array>> {
  const providers = [
    { name: "Gemini", fn: streamGemini },
    { name: "OpenRouter", fn: streamOpenRouter },
    { name: "Groq", fn: streamGroq },
  ];

  for (const provider of providers) {
    try {
      console.log(`Trying provider: ${provider.name}`);
      return await provider.fn(messages);
    } catch (err) {
      console.warn(`${provider.name} failed:`, (err as Error).message);
    }
  }
  throw new Error("All AI providers failed.");
}

/** Non-streaming fallback (used for cache population) */
export async function generateResponse(messages: Message[]): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const userMessages = messages.filter((m) => m.role !== "system");
  const lastMessage = userMessages.at(-1)?.content ?? "";
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SYSTEM_PROMPT });
  const history = userMessages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage);
  return result.response.text();
}
