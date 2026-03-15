"use client";
import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import { SidebarContext } from "@/app/lib/SidebarContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarContext value={{ openSidebar: () => setOpen(true) }}>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile backdrop */}
        {open && (
          <div
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <Sidebar open={open} onClose={() => setOpen(false)} />

        <main className="flex-1 overflow-hidden w-full min-w-0">{children}</main>
      </div>
    </SidebarContext>
  );
}
