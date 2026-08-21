import Link from "next/link";
import { NAV } from "@/lib/nav";

export default function HomePage() {
  const quick = NAV.filter((n) => n.href !== "/").slice(0, 8);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-accent">
          Home Dashboard
        </h1>
        <p className="text-white/55 mt-1 text-sm">
          Step 2 OK — Sidebar + Top bar active. Click a menu item (pages come in next steps).
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {quick.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-border bg-panel p-4 hover:border-accent/40 transition"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-sm font-medium text-white/90">{item.label}</div>
            <div className="text-[10px] text-white/35 mt-1">{item.group}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-panel p-5 text-sm text-white/60">
        <p className="text-accent font-medium mb-1">Next</p>
        After Vercel is green, upload <strong>Step 3</strong> — first route pages
        (Virtual PC, Settings placeholders).
      </div>
    </div>
  );
}
