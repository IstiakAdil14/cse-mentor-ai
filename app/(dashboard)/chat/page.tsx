import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Chat from "@/app/models/Chat";
import { redirect } from "next/navigation";

export default async function ChatIndexPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await connectDB();
  const userId = (session.user as { id: string }).id;

  let chat = await Chat.findOne({ userId }).sort({ updatedAt: -1 }).lean() as { _id: { toString(): string } } | null;

  if (!chat) {
    chat = await Chat.create({ userId, title: "New Chat" });
  }

  redirect(`/chat/${(chat as { _id: { toString(): string } })._id.toString()}`);
}
