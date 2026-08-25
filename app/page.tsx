"use client";

import Link from "next/link";
import { NAV } from "@/lib/nav";

export default function HomePage() {
  const items = NAV.filter((n) => n.href !== "/");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/80">
          PASIYA MAX // CMD
        </p>
        <h1 className="text-2xl font-bold text-accent sm:text-3xl">
          Command Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Open any service from the cards below or the sidebar. Agent Workspace
          is the Gemini coding agent. Chat bubble (bottom-right) is n8n support.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-border bg-panel px-4 py-4 transition hover:border-accent/40"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {item.icon}
              </span>
              <div>
                <p className="font-semibold text-white">{item.label}</p>
                <p className="text-[11px] text-white/40">{item.group || "App"}</p>
              </div>
            </div>
            <p className="mt-2 truncate font-mono text-[10px] text-white/30">
              {item.href}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 
