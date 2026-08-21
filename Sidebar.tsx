"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { Icon } from "./Icons";
import { useState } from "react";

export function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const groups = ["Main", "Platform", "Pro", "System"];

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-line">
        <div className="h-8 w-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold">
          P
        </div>
        <div>
          <div className="text-sm font-bold tracking-wide text-white">PASiYA MAX</div>
          <div className="text-[10px] text-accent">// CMD SaaS</div>
        </div>
        <button className="ml-auto md:hidden text-muted" onClick={() => setOpen(false)}>
          <Icon name="X" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {groups.map((g) => (
          <div key={g}>
            <div className="px-3 mb-1 text-[10px] uppercase tracking-widest text-muted/70">{g}</div>
            <div className="space-y-0.5">
              {NAV.filter((n) => n.group === g).map((n) => {
                const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`sidebar-link ${active ? "active" : ""}`}
                  >
                    <Icon name={n.icon} className="w-4 h-4 shrink-0" />
                    <span>{n.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-line text-[11px] text-muted">
        v2.0 · Dashboard Shell
      </div>
    </div>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-3 left-3 z-40 btn"
        onClick={() => setOpen(true)}
        aria-label="Menu"
      >
        <Icon name="Menu" />
      </button>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`fixed md:static z-50 h-full w-64 border-r border-line bg-bg-panel transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
