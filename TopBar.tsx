"use client";

import { Icon } from "./Icons";
import { useState } from "react";

export function TopBar() {
  const [q, setQ] = useState("");
  const [notifs] = useState([
    { id: 1, t: "Welcome to PASiYA MAX // CMD" },
    { id: 2, t: "Connect Supabase in Settings for cloud sync" }
  ]);
  const [showN, setShowN] = useState(false);

  return (
    <header className="h-14 shrink-0 border-b border-line bg-bg-panel/90 backdrop-blur flex items-center gap-3 px-4 md:px-6">
      <div className="hidden md:block text-xs text-muted pl-0">Command Center</div>
      <div className="flex-1 max-w-xl mx-auto relative">
        <Icon name="Search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input pl-9"
          placeholder="Search pages, services, docs…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="relative">
        <button className="btn relative" onClick={() => setShowN((v) => !v)}>
          <Icon name="Bell" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] text-black flex items-center justify-center font-bold">
            {notifs.length}
          </span>
        </button>
        {showN && (
          <div className="absolute right-0 mt-2 w-72 card z-30">
            {notifs.map((n) => (
              <div key={n.id} className="py-2 text-sm border-b border-line last:border-0 text-muted">
                {n.t}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 rounded-full border border-line bg-bg-elev px-2 py-1">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-accent to-blue-600" />
        <div className="hidden sm:block text-xs pr-1">
          <div className="font-semibold text-white">Pasindu</div>
          <div className="text-muted">Admin</div>
        </div>
      </div>
    </header>
  );
}
