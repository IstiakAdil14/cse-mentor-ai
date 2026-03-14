import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { aiCache } from "@/app/lib/cache";
import { streamResponse } from "@/app/lib/ai/router";
import { checkRateLimit } from "@/app/lib/rate-limit";
import { retrieveContext } from "@/app/lib/rag/retrieve";
import { SYSTEM_PROMPT } from "@/app/utils/prompts";
import { connectDB } from "@/app/lib/mongodb";
import Message from "@/app/models/Message";
import Chat from "@/app/models/Chat";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as { id: string }).id;

    const { allowed, retryAfter } = checkRateLimit(userId);
    if (!allowed) {
      return Response.json(
        { error: `Rate limit exceeded. Try again in ${retryAfter}s.` },
        { status: 429 }
      );
    }

    const { messages, chatId } = await req.json();
    const lastMessage: string = messages.at(-1)?.content ?? "";
    const cacheKey = lastMessage.trim().toLowerCase();

    // Save user message to DB
    if (chatId) {
      await connectDB();
      const chat = await Chat.findOne({ _id: chatId, userId });
      if (chat) {
        if (chat.title === "New Chat") {
          chat.title = lastMessage.slice(0, 60);
          await chat.save();
        }
        await Message.create({ chatId, role: "user", content: lastMessage });
      }
    }

    // Return cached response as stream
    const cached = aiCache.get<string>(cacheKey);
    if (cached) {
      // Save cached assistant response to DB
      if (chatId) {
        await Message.create({ chatId, role: "assistant", content: cached });
      }
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(cached));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Cache": "HIT" },
      });
    }

    // RAG context
    const ragContext = await retrieveContext(lastMessage);
    const systemContent = ragContext
      ? `${SYSTEM_PROMPT}\n\n## Relevant Study Materials\n${ragContext}`
      : SYSTEM_PROMPT;

    const allMessages = [
      { role: "system" as const, content: systemContent },
      ...messages,
    ];

    const responseStream = await streamResponse(allMessages);
    const [clientStream, cacheStream] = responseStream.tee();

    // Collect full response for caching + DB save
    (async () => {
      const reader = cacheStream.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
      }
      if (full) {
        aiCache.set(cacheKey, full);
        if (chatId) {
          await Message.create({ chatId, role: "assistant", content: full });
        }
      }
    })();

    return new Response(clientStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Cache": "MISS",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
