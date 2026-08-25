export const runtime = "nodejs";

/** PASIYA MAX site FAQ bot — no n8n, no paid API */
const KNOWLEDGE: { keys: string[]; answer: string }[] = [
  {
    keys: ["hello", "hi", "hey", "ayubowan", "හායි", "හෙලෝ"],
    answer:
      "Hi! Welcome to PASIYA MAX // CMD. I can tell you about our dashboard services — Agent Workspace, Virtual PC, Hosting, Web Studio, and more. What would you like to know?",
  },
  {
    keys: ["agent", "workspace", "gemini", "coding agent", "ගැනට්"],
    answer:
      "Agent Workspace (/agent) is our coding AI agent. It can list/read project files on GitHub and help with tasks. The admin can turn it ON/OFF to save free AI quota. Open it from the sidebar: Agent Workspace.",
  },
  {
    keys: ["virtual", "pc", "vps", "computer"],
    answer:
      "Virtual PC is a dashboard tool for remote/dev-style workflows inside PASIYA MAX. Open it from the sidebar: Virtual PC (/virtual-pc).",
  },
  {
    keys: ["host", "hosting", "database", "db", "supabase", "vercel"],
    answer:
      "Hosting · DB links your stack: Vercel (website), Supabase (database/auth), GitHub (code), and related dashboards. Open Hosting · DB from the sidebar (/hosting).",
  },
  {
    keys: ["web studio", "studio", "design", "website builder"],
    answer:
      "Web Studio is the creative/build area in the dashboard for web-related work. Open Web Studio from the sidebar (/web-studio).",
  },
  {
    keys: ["social", "instagram", "facebook", "youtube", "tiktok"],
    answer:
      "Social Nexus collects social profile links and related tools. Open Social Nexus from the sidebar (/social).",
  },
  {
    keys: ["analytics", "stats", "traffic"],
    answer:
      "Analytics shows dashboard metrics and insights for the platform. Open Analytics from the sidebar (/analytics).",
  },
  {
    keys: ["finance", "money", "payment", "billing"],
    answer:
      "Finance Center is the money/billing related panel in the dashboard. Open Finance from the sidebar (/finance).",
  },
  {
    keys: ["security", "login", "password", "2fa"],
    answer:
      "Security Center covers account safety related tools (API keys, access, etc.). Open Security from the sidebar (/security).",
  },
  {
    keys: ["storage", "file", "upload", "cloud"],
    answer:
      "Cloud Storage is the files panel in the dashboard. Open Cloud Storage from the sidebar (/storage).",
  },
  {
    keys: ["team", "member", "invite", "collaborate"],
    answer:
      "Team is for collaboration / members (dashboard section). Open Team from the sidebar (/team).",
  },
  {
    keys: ["automation", "n8n", "make", "zapier", "workflow"],
    answer:
      "Automation Lab is for workflow automation ideas. The site chat no longer depends on n8n Cloud. Open Automation Lab from the sidebar (/automation).",
  },
  {
    keys: ["marketplace", "apps", "plugin"],
    answer:
      "Marketplace is where apps/widgets can be listed in the dashboard. Open Marketplace from the sidebar (/marketplace).",
  },
  {
    keys: ["setting", "config", "supabase key"],
    answer:
      "Settings lets you manage local/dashboard preferences. Open Settings from the sidebar (/settings).",
  },
  {
    keys: ["price", "cost", "free", "මිල", "ගාන"],
    answer:
      "PASIYA MAX dashboard is your own SaaS shell hosted on Vercel. Some AI features use free API limits (admin can turn Agent OFF to save quota). Ask if you want details about a specific service.",
  },
  {
    keys: ["contact", "support", "help", "උදව්"],
    answer:
      "You are chatting with the on-site helper bot. For platform features, use the sidebar services. For coding tasks, open Agent Workspace (when the admin has turned it ON).",
  },
  {
    keys: ["what is", "pasiya", "about", "මොකක්ද", "platform"],
    answer:
      "PASIYA MAX // CMD is a professional SaaS-style command dashboard: Virtual PC, Agent Workspace (AI), Web Studio, Hosting/DB links, Social, Analytics, Finance, Team, Automation, Storage, Security, Marketplace, and Settings — all in one place.",
  },
];

function replyFor(message: string): string {
  const q = message.toLowerCase();
  const hits: { score: number; answer: string }[] = [];

  for (const row of KNOWLEDGE) {
    let score = 0;
    for (const k of row.keys) {
      if (q.includes(k.toLowerCase())) score += 1;
    }
    if (score > 0) hits.push({ score, answer: row.answer });
  }

  hits.sort((a, b) => b.score - a.score);
  if (hits[0]) return hits[0].answer;

  return (
    "I can help with PASIYA MAX services: Agent Workspace, Virtual PC, Web Studio, Hosting, Social, Analytics, Finance, Team, Automation, Storage, Security, Marketplace, and Settings. " +
    "Try asking e.g. “What is Agent Workspace?” or “How do I open Hosting?”"
  );
}

export async function POST(req: Request) {
  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = String(body.message || "").trim();
  if (!message) {
    return Response.json({ error: "Empty message" }, { status: 400 });
  }

  return Response.json({
    reply: replyFor(message),
  });
}                                                                                
