"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-bg text-white">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopBar onMenu={() => setOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
