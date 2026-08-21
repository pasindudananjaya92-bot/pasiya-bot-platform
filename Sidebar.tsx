"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const path = usePathname() || "/";

  const groups = Array.from(new Set(NAV.map((n) => n.group || "Main")));

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={[
          "fixed md:static z-50 top-0 left-0 h-full w-64 shrink-0",
          "bg-panel border-r border-border flex flex-col",
          "transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-accent font-bold tracking-wide text-sm">
              PASiYA MAX
            </div>
            <div className="text-[10px] text-white/40">// CMD Dashboard</div>
          </div>
          <button
            type="button"
            className="md:hidden text-white/60 text-xl px-2"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {groups.map((g) => (
            <div key={g}>
              <div className="px-2 mb-1 text-[10px] uppercase tracking-wider text-white/35">
                {g}
              </div>
              <ul className="space-y-0.5">
                {NAV.filter((n) => (n.group || "Main") === g).map((item) => {
                  const active =
                    item.href === "/"
                      ? path === "/"
                      : path.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={[
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                          active
                            ? "bg-accent/15 text-accent border border-accent/30"
                            : "text-white/75 hover:bg-white/5 hover:text-white",
                        ].join(" ")}
                      >
                        <span className="w-5 text-center">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border text-[10px] text-white/30">
          Step 2 · Shell ready
        </div>
      </aside>
    </>
  );
}
