"use client";
import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "already_registered") {
      setError("An account with this Google email already exists. Please sign in.");
    }
    // Successful Google signup lands back on /register?google=true — redirect to chat
    if (searchParams.get("google") === "true") {
      router.replace("/chat");
    }
  }, [searchParams, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      {/* Floating accent orb */}
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)",
          bottom: "20%",
          right: "5%",
          animation: "floatOrb 22s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 440 }} className="animate-slide-up">
        <div className="glass-card" style={{ padding: "2.5rem" }}>
          {/* Branding */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 1rem",
                borderRadius: "1rem",
                background:
                  "linear-gradient(135deg, var(--accent-purple), var(--accent-pink))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "white",
                boxShadow: "var(--glow-purple)",
              }}
            >
              CS
            </div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.4rem",
              }}
            >
              Create account
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Get started with CSE Mentor AI
            </p>
          </div>

          {/* Error */}
          {error && <div className="error-alert">{error}</div>}

          {/* Google OAuth */}
          <div className="animate-slide-up-delayed" style={{ marginTop: error ? "1rem" : 0 }}>
            <button
              onClick={() => signIn("google", { callbackUrl: "/register?google=true" }, { prompt: "select_account" })}
              className="btn-google"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="auth-divider animate-slide-up-delayed">
            <span>or continue with email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="animate-slide-up-delayed-2">
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: "0.4rem",
                }}
              >
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: "0.4rem",
                }}
              >
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: "0.4rem",
                }}
              >
                Password
              </label>
              <input
                id="register-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-purple), var(--accent-pink))",
              }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              marginTop: "1.75rem",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--accent-purple)",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}