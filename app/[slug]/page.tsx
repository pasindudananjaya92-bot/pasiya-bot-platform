"use client";

import { useEffect, useState } from "react";
import { VirtualPC } from "@/components/VirtualPC";
import { AiAgentPanel } from "@/components/AiAgentPanel";

const PAGES: Record<string, { title: string; desc: string }> = {
  "web-studio": { title: "✨ Web Studio", desc: "Code editor + website builder (placeholder)." },
  analytics: { title: "📊 Analytics Hub", desc: "Visitors, page views charts — connect data later." },
  finance: { title: "💰 Finance Center", desc: "Income / expenses tracker (placeholder)." },
  team: { title: "👥 Team & Collaboration", desc: "Invite members, workspace chat (placeholder)." },
  automation: { title: "⚡ Automation Lab", desc: "Use AI Agent page with your n8n webhook." },
  storage: { title: "🗄 Cloud Storage", desc: "Upload / download files (placeholder)." },
  security: { title: "🔒 Security Center", desc: "2FA, login history, API keys (placeholder)." },
  marketplace: { title: "🛒 Marketplace", desc: "Install apps & widgets (placeholder)." },
};

const HOSTING = [
  { name: "GitHub Repo", href: "https://github.com/pasindudananjaya92-bot/pasiya-bot-platform" },
  { name: "Vercel Dashboard", href: "https://vercel.com/dashboard" },
  { name: "Supabase", href: "https://supabase.com/dashboard" },
  { name: "MongoDB Atlas", href: "https://cloud.mongodb.com" },
  { name: "n8n Cloud", href: "https://app.n8n.cloud" },
  { name: "Replit", href: "https://replit.com" },
];

const SOCIAL = [
  { name: "Instagram", href: "https://www.instagram.com/pasindu5598" },
  { name: "Facebook", href: "https://www.facebook.com/share/18xRGhYVUo/" },
  { name: "YouTube", href: "https://youtube.com/@pasya" },
  { name: "TikTok", href: "https://tiktok.com/@pasindudananjaya619" },
  { name: "GitHub", href: "https://github.com/pasindudananjaya92-bot" },
];

const DEV = [
  { name: "VS Code Web", href: "https://vscode.dev" },
  { name: "CodeSandbox", href: "https://codesandbox.io" },
  { name: "StackBlitz", href: "https://stackblitz.com" },
];

function LinkGrid({ items }: { items: { name: string; href: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => (
        <a key={item.href} href={item.href} target="_blank" rel="noreferrer"
          className="rounded-xl border border-border bg-panel px-4 py-3 text-sm hover:border-accent/40 transition">
          {item.name}
          <span className="block text-[10px] text-white/35 truncate mt-1">{item.href}</span>
        </a>
      ))}
    </div>
  );
}

function SettingsPanel() {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    try {
      setUrl(localStorage.getItem("pasiya_supabase_url") || "");
      setKey(localStorage.getItem("pasiya_supabase_anon") || "");
    } catch {}
  }, []);
  function save() {
    try {
      localStorage.setItem("pasiya_supabase_url", url.trim());
      localStorage.setItem("pasiya_supabase_anon", key.trim());
      setMsg("Saved on this device");
    } catch { setMsg("Could not save"); }
  }
  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold text-accent">⚙ Settings</h1>
      <label className="block text-xs text-white/50 mb-1">Supabase Project URL</label>
      <input className="w-full rounded-xl bg-bg border border-border px-3 py-2 text-sm mb-3"
        value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
      <label className="block text-xs text-white/50 mb-1">Supabase anon public key</label>
      <input className="w-full rounded-xl bg-bg border border-border px-3 py-2 text-sm mb-3"
        value={key} onChange={(e) => setKey(e.target.value)} placeholder="anon key" />
      <button type="button" onClick={save} className="rounded-xl bg-accent text-black font-semibold px-4 py-2 text-sm">Save</button>
      {msg && <p className="text-sm text-accent">{msg}</p>}
    </div>
  );
}

export default function DynamicPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  if (slug === "virtual-pc") return <VirtualPC />;
  if (slug === "ai-agent") return <AiAgentPanel />;
  if (slug === "settings") return <SettingsPanel />;
  if (slug === "hosting") return (<div className="space-y-4"><h1 className="text-2xl font-bold text-accent">☁ Hosting</h1><LinkGrid items={HOSTING} /></div>);
  if (slug === "social") return (<div className="space-y-4"><h1 className="text-2xl font-bold text-accent">📡 Social</h1><LinkGrid items={SOCIAL} /></div>);
  if (slug === "developer") return (<div className="space-y-4"><h1 className="text-2xl font-bold text-accent">⚙ Developer</h1><LinkGrid items={DEV} /></div>);
  const page = PAGES[slug];
  if (!page) return (<div><h1 className="text-2xl font-bold text-accent">404</h1><p className="text-white/60 text-sm">{slug}</p></div>);
  return (<div className="space-y-3"><h1 className="text-2xl font-bold text-accent">{page.title}</h1><p className="text-white/60 text-sm">{page.desc}</p></div>);
}
