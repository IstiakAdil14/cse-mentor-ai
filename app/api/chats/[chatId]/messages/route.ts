import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Message from "@/app/models/Message";
import Chat from "@/app/models/Chat";

type Params = { params: Promise<{ chatId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId } = await params;
  await connectDB();

  const userId = (session.user as { id: string }).id;
  const chat = await Chat.findOne({ _id: chatId, userId }).lean();
  if (!chat) return Response.json({ error: "Not found" }, { status: 404 });

  const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).lean();
  return Response.json(messages);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId } = await params;
  const { role, content } = await req.json();

  await connectDB();

  const userId = (session.user as { id: string }).id;
  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) return Response.json({ error: "Not found" }, { status: 404 });

  // Auto-set title from first user message
  if (role === "user" && chat.title === "New Chat") {
    chat.title = content.slice(0, 60);
    await chat.save();
  }

  const message = await Message.create({ chatId, role, content });
  return Response.json(message);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId } = await params;
  await connectDB();

  const userId = (session.user as { id: string }).id;
  await Chat.deleteOne({ _id: chatId, userId });
  await Message.deleteMany({ chatId });
  return Response.json({ ok: true });
}
