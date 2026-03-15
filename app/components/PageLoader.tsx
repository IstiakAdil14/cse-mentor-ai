"use client";
import { useEffect, useState } from "react";

export default function PageLoader({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setFading(true), 2000);
    const hide = setTimeout(() => setVisible(false), 2500);
    return () => { clearTimeout(fade); clearTimeout(hide); };
  }, []);

  return (
    <>
      {visible && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "radial-gradient(ellipse at 60% 40%, #1a1040 0%, #0a0e1a 60%, #000510 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          transition: "opacity 0.5s ease",
          opacity: fading ? 0 : 1,
          pointerEvents: fading ? "none" : "all",
          overflow: "hidden",
        }}>

          {/* Ambient orbs */}
          <div style={{
            position: "absolute", width: 600, height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
            top: "-150px", right: "-150px",
            animation: "floatOrb 8s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 500, height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
            bottom: "-120px", left: "-120px",
            animation: "floatOrb 10s ease-in-out infinite reverse",
          }} />
          <div style={{
            position: "absolute", width: 300, height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
            top: "40%", left: "10%",
            animation: "floatOrb 12s ease-in-out infinite 2s",
          }} />

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
              height: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
              borderRadius: "50%",
              background: ["#3b82f6","#8b5cf6","#06b6d4","#ec4899"][i % 4],
              left: `${10 + (i * 7.5)}%`,
              top: `${15 + (i % 5) * 15}%`,
              opacity: 0.6,
              animation: `floatParticle ${3 + (i % 4)}s ease-in-out infinite ${i * 0.3}s`,
            }} />
          ))}

          {/* Glowing ring around icon */}
          <div style={{
            position: "relative",
            marginBottom: "1.5rem",
            animation: "slideUp 0.6s ease-out forwards",
          }}>
            {/* Outer pulse ring */}
            <div style={{
              position: "absolute", inset: -16,
              borderRadius: "50%",
              border: "1px solid rgba(59,130,246,0.3)",
              animation: "ringPulse 2s ease-in-out infinite",
            }} />
            {/* Middle ring */}
            <div style={{
              position: "absolute", inset: -8,
              borderRadius: "50%",
              border: "1px solid rgba(139,92,246,0.4)",
              animation: "ringPulse 2s ease-in-out infinite 0.4s",
            }} />
            {/* Icon container */}
            <div style={{
              width: 88, height: 88,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.8rem",
              boxShadow: "0 0 40px rgba(59,130,246,0.25), 0 0 80px rgba(139,92,246,0.15)",
              animation: "iconFloat 3s ease-in-out infinite",
            }}>
              🎓
            </div>
          </div>

          {/* Title */}
          <div style={{
            textAlign: "center",
            animation: "slideUp 0.6s ease-out 0.15s both",
          }}>
            <div style={{
              fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #60a5fa, #a78bfa, #67e8f9)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmerText 2.5s linear infinite",
              marginBottom: "0.35rem",
            }}>
              CSE Mentor AI
            </div>
            <div style={{
              fontSize: "0.82rem", color: "rgba(148,163,184,0.7)",
              letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500,
            }}>
              Your AI-Powered CS Tutor
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            marginTop: "2.5rem",
            width: 200,
            animation: "slideUp 0.6s ease-out 0.3s both",
          }}>
            <div style={{
              height: 3, borderRadius: 99,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
                backgroundSize: "200% 100%",
                animation: "progressFill 1.8s ease-out forwards, shimmerBar 1.5s linear infinite",
              }} />
            </div>
          </div>

        </div>
      )}
      {children}
    </>
  );
}
