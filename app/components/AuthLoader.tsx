"use client";

interface Props {
  message: string;
  subtext?: string;
  emoji?: string;
}

export default function AuthLoader({ message, subtext, emoji = "🎓" }: Props) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "radial-gradient(ellipse at 60% 40%, #1a1040 0%, #0a0e1a 60%, #000510 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.3s ease-out",
      overflow: "hidden",
    }}>

      {/* Ambient orbs */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
        top: "-150px", right: "-150px",
        animation: "floatOrb 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        bottom: "-120px", left: "-120px",
        animation: "floatOrb 10s ease-in-out infinite reverse",
      }} />

      {/* Particles */}
      {[...Array(10)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: i % 3 === 0 ? 4 : 3,
          height: i % 3 === 0 ? 4 : 3,
          borderRadius: "50%",
          background: ["#3b82f6","#8b5cf6","#06b6d4","#ec4899"][i % 4],
          left: `${10 + i * 8}%`,
          top: `${15 + (i % 5) * 15}%`,
          opacity: 0.5,
          animation: `floatParticle ${3 + (i % 4)}s ease-in-out infinite ${i * 0.3}s`,
        }} />
      ))}

      {/* Icon with rings */}
      <div style={{ position: "relative", marginBottom: "1.75rem", animation: "slideUp 0.5s ease-out both" }}>
        <div style={{
          position: "absolute", inset: -16, borderRadius: "50%",
          border: "1px solid rgba(59,130,246,0.3)",
          animation: "ringPulse 2s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", inset: -8, borderRadius: "50%",
          border: "1px solid rgba(139,92,246,0.4)",
          animation: "ringPulse 2s ease-in-out infinite 0.4s",
        }} />
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.8rem",
          boxShadow: "0 0 40px rgba(59,130,246,0.25), 0 0 80px rgba(139,92,246,0.15)",
          animation: "iconFloat 3s ease-in-out infinite",
        }}>
          {emoji}
        </div>
      </div>

      {/* Text */}
      <div style={{ textAlign: "center", animation: "slideUp 0.5s ease-out 0.1s both" }}>
        <div style={{
          fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em",
          background: "linear-gradient(135deg, #60a5fa, #a78bfa, #67e8f9)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "shimmerText 2.5s linear infinite",
          marginBottom: "0.4rem",
        }}>
          {message}
        </div>
        {subtext && (
          <div style={{
            fontSize: "0.82rem", color: "rgba(148,163,184,0.65)",
            letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500,
          }}>
            {subtext}
          </div>
        )}
      </div>

      {/* Animated dots */}
      <div style={{
        display: "flex", gap: "0.5rem", marginTop: "2rem",
        animation: "slideUp 0.5s ease-out 0.2s both",
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            animation: `dotBounce 1.2s ease-in-out infinite ${i * 0.2}s`,
          }} />
        ))}
      </div>

    </div>
  );
}
