"use client";

import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";

const quick = [
  { href: "/virtual-pc", label: "Virtual PC", icon: "💻", group: "Main" },
  { href: "/ai-agent", label: "AI Agent", icon: "🤖", group: "Main" },
  { href: "/web-studio", label: "Web Studio", icon: "✨", group: "Main" },
  { href: "/analytics", label: "Analytics", icon: "📊", group: "Pro" },
  { href: "/finance", label: "Finance", icon: "💰", group: "Pro" },
  { href: "/settings", label: "Settings", icon: "⚙", group: "System" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-accent">
          Home Dashboard
        </h1>
        <p className="text-white/55 mt-1 text-sm">
          Search Supabase profiles · quick launch tools
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-panel p-4 md:p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/80">Profile search</h2>
        <SearchBar />
      </section>

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
    </div>
  );
}
