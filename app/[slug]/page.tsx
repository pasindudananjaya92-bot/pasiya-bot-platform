const PAGES: Record<string, { title: string; desc: string }> = {
  "virtual-pc": {
    title: "💻 Virtual PC",
    desc: "Desktop OS shell — full Web PC UI comes in a later step.",
  },
  "ai-agent": {
    title: "🤖 AI Agent",
    desc: "Chat + agent tools workspace (placeholder).",
  },
  "web-studio": {
    title: "✨ Web Studio",
    desc: "Code editor + website builder (placeholder).",
  },
  hosting: {
    title: "☁ Hosting · DB · Backend",
    desc: "Replit, Vercel, Supabase, MongoDB, GitHub links hub.",
  },
  developer: {
    title: "⚙ Developer & Productivity",
    desc: "VS Code, Cursor, Postman, Notion style tools hub.",
  },
  social: {
    title: "📡 Social Nexus",
    desc: "Instagram, Facebook, YouTube, Telegram quick links.",
  },
  analytics: {
    title: "📊 Analytics Hub",
    desc: "Visitors, page views charts — Supabase later.",
  },
  finance: {
    title: "💰 Finance Center",
    desc: "Income / expenses tracker (placeholder).",
  },
  team: {
    title: "👥 Team & Collaboration",
    desc: "Invite members, workspace chat (placeholder).",
  },
  automation: {
    title: "⚡ Automation Lab",
    desc: "n8n / Make style workflows (placeholder).",
  },
  storage: {
    title: "🗄 Cloud Storage",
    desc: "Upload / download files (placeholder).",
  },
  security: {
    title: "🔒 Security Center",
    desc: "2FA, login history, API keys (placeholder).",
  },
  marketplace: {
    title: "🛒 Marketplace",
    desc: "Install apps & widgets (placeholder).",
  },
  settings: {
    title: "⚙ Settings",
    desc: "Profile, API keys, Supabase URL (placeholder).",
  },
};

export default function DynamicPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = PAGES[params.slug];

  if (!page) {
    return (
      <div className="max-w-3xl space-y-3">
        <h1 className="text-2xl font-bold text-accent">404</h1>
        <p className="text-white/60 text-sm">Page not found: {params.slug}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-3">
      <h1 className="text-2xl font-bold text-accent">{page.title}</h1>
      <p className="text-white/60 text-sm">{page.desc}</p>
      <div className="rounded-2xl border border-border bg-panel p-5 text-sm text-white/50">
        Step 3 · Route ready. Feature UI will be added in later steps.
      </div>
    </div>
  );
} 
