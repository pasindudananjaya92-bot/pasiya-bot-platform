import Link from "next/link";
import { NAV } from "@/lib/nav";

export default function HomePage() {
  const quick = NAV.filter((n) => n.href !== "/").slice(0, 8);
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Command Center
        </h1>
        <p className="text-muted mt-1 text-sm">
          PASiYA MAX // CMD — SaaS dashboard for AI, Virtual PC, hosting & growth tools.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "Services", v: "40+", s: "Linked tools" },
          { k: "Modules", v: "15", s: "Dashboard pages" },
          { k: "Stack", v: "Next.js", s: "Vercel + Supabase" },
          { k: "Status", v: "Online", s: "Production shell" }
        ].map((c) => (
          <div key={c.k} className="card">
            <div className="text-xs text-muted">{c.k}</div>
            <div className="text-2xl font-bold text-accent mt-1">{c.v}</div>
            <div className="text-xs text-muted mt-1">{c.s}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Quick Launch</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {quick.map((n) => (
            <Link key={n.href} href={n.href} className="card hover:border-accent/40 transition text-sm font-medium">
              {n.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-white">Deploy notes</h2>
        <ol className="mt-2 text-sm text-muted list-decimal pl-5 space-y-1">
          <li>Copy <code className="text-accent">.env.example</code> → <code className="text-accent">.env.local</code></li>
          <li>Add Supabase URL + anon key for cloud features</li>
          <li><code className="text-accent">npm i && npm run dev</code> locally · or import repo to Vercel</li>
        </ol>
      </div>
    </div>
  );
}
