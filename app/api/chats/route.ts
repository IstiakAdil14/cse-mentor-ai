import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Chat from "@/app/models/Chat";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as { id: string }).id;
  const chats = await Chat.find({ userId }).sort({ updatedAt: -1 }).lean();
  return Response.json(chats);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as { id: string }).id;
  const chat = await Chat.create({ userId, title: "New Chat" });
  return Response.json(chat);
}
