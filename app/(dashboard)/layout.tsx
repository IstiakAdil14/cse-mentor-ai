"use client";
import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-30 md:hidden flex flex-col gap-1.5 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-glass)]"
        aria-label="Open sidebar"
      >
        <span className="block w-5 h-0.5 bg-[var(--text-secondary)]" />
        <span className="block w-5 h-0.5 bg-[var(--text-secondary)]" />
        <span className="block w-5 h-0.5 bg-[var(--text-secondary)]" />
      </button>

      <Sidebar open={open} onClose={() => setOpen(false)} />

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
