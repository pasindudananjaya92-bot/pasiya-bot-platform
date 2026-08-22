"use client";

import { useEffect, useRef } from "react";

export type TermLine = {
  id: string;
  level: "info" | "tool" | "success" | "error" | "mem" | "sandbox" | "approval";
  text: string;
  ts: number;
};

const COLORS: Record<TermLine["level"], string> = {
  info: "text-slate-400",
  tool: "text-cyan-400",
  success: "text-emerald-400",
  error: "text-rose-400",
  mem: "text-violet-400",
  sandbox: "text-amber-400",
  approval: "text-yellow-300",
};

const PREFIX: Record<TermLine["level"], string> = {
  info: "·",
  tool: "▸",
  success: "✓",
  error: "✗",
  mem: "◆",
  sandbox: "⌘",
  approval: "!",
};

export default function AgentTerminal({ lines }: { lines: TermLine[] }) {
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="flex h-full min-h-[160px] flex-col rounded-xl border border-white/10 bg-[#070b14] font-mono text-[11px] leading-relaxed">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500">
        <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
        Agent Terminal
        <span className="ml-auto text-slate-600">{lines.length} lines</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {lines.length === 0 && (
          <p className="text-slate-600">Waiting for agent activity…</p>
        )}
        {lines.map((l) => (
          <div key={l.id} className={`flex gap-2 ${COLORS[l.level]}`}>
            <span className="shrink-0 opacity-60">{PREFIX[l.level]}</span>
            <pre className="whitespace-pre-wrap break-all font-mono">{l.text}</pre>
          </div>
        ))}
        <div ref={bottom} />
      </div>
    </div>
  );
}
