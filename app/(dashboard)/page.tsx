"use client";
import { useSession, signOut } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="dashboard-bg">
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "0.5rem",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "white",
            }}
          >
            CS
          </div>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            CSE Mentor AI
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {session?.user?.name && (
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              {session.user.name}
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-signout"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main Content — Blank Dashboard */}
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 65px)",
          padding: "2rem",
        }}
      >
        <div className="animate-slide-up" style={{ textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              margin: "0 auto 1.5rem",
              borderRadius: "1.25rem",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 800,
              color: "white",
              boxShadow: "var(--glow-blue)",
            }}
          >
            CS
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.05rem",
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Your dashboard is being built. <br />
            Exciting features are coming soon.
          </p>

          <div
            className="glass-card animate-slide-up-delayed"
            style={{
              marginTop: "2.5rem",
              padding: "1.5rem 2rem",
              display: "inline-block",
            }}
          >
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              🚀 Under Construction
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}