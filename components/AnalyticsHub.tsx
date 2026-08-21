"use client";

import { useMemo, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BASE = [42, 55, 38, 70, 62, 88, 51];

export function AnalyticsHub() {
  const [boost, setBoost] = useState(1);
  const data = useMemo(() => BASE.map((v) => Math.round(v * boost)), [boost]);
  const max = Math.max(...data, 1);
  const total = data.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-accent">📊 Analytics Hub</h1>
          <p className="text-[11px] text-white/45">Demo charts · later connect real visitors</p>
        </div>
        <label className="text-xs text-white/50 flex items-center gap-2">
          Scale
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={boost}
            onChange={(e) => setBoost(Number(e.target.value))}
            className="w-28"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Page views (7d)", value: total },
          { label: "Peak day", value: Math.max(...data) },
          { label: "Avg / day", value: Math.round(total / 7) },
          { label: "Live (demo)", value: Math.round(12 * boost) },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-panel p-3">
            <div className="text-[10px] text-white/40">{c.label}</div>
            <div className="text-xl font-bold text-accent mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-panel p-4">
        <div className="text-xs text-white/50 mb-3">Weekly traffic</div>
        <div className="flex items-end gap-2 h-40">
          {data.map((v, i) => (
            <div key={DAYS[i]} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[9px] text-white/40">{v}</span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-accent/40 to-accent min-h-[4px] transition-all"
                style={{ height: `${(v / max) * 100}%` }}
              />
              <span className="text-[10px] text-white/50">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-panel p-4 text-sm text-white/60">
        <p className="font-semibold text-white/80 mb-1">Next connect</p>
        <p className="text-xs">Supabase table or Vercel Analytics can feed real numbers here.</p>
      </div>
    </div>
  );
}
