import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import Chat from "@/app/models/Chat";
import Message from "@/app/models/Message";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await connectDB();
  const userId = (session.user as { id: string }).id;

  const totalChats = await Chat.countDocuments({ userId });
  const chatIds = await Chat.find({ userId }).distinct("_id");
  const totalMessages = await Message.countDocuments({ chatId: { $in: chatIds }, role: "user" });

  const user = session.user as { name?: string | null; email?: string | null; image?: string | null };
  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";
  const joinDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "var(--gradient-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.5rem", fontWeight: 700, color: "white",
          boxShadow: "var(--glow-blue)", flexShrink: 0,
        }}>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="avatar" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }} />
          ) : initials}
        </div>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            {user.name ?? "User"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{user.email}</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.25rem" }}>
            Member since {joinDate}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Chats", value: totalChats, icon: "💬" },
          { label: "Questions Asked", value: totalMessages, icon: "❓" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>{stat.icon}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)" }}>{stat.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Account Info */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "1rem" }}>
          Account Details
        </h2>
        {[
          { label: "Name", value: user.name ?? "—" },
          { label: "Email", value: user.email ?? "—" },
          { label: "Auth Provider", value: user.image ? "Google OAuth" : "Email & Password" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid var(--border-glass)" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{item.label}</span>
            <span style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
      </div>

      <a
        href="/chat"
        style={{
          display: "block", marginTop: "1.5rem", padding: "0.75rem",
          background: "var(--gradient-primary)", borderRadius: "0.75rem",
          color: "white", fontWeight: 600, textAlign: "center",
          textDecoration: "none", fontSize: "0.9rem",
        }}
      >
        ← Back to Chat
      </a>
    </div>
  );
}
