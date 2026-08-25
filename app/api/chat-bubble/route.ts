export const runtime = "nodejs";

function isSinhala(text: string) {
  return /[\u0D80-\u0DFF]/.test(text);
}

type Row = { keys: string[]; en: string; si: string };

const KNOWLEDGE: Row[] = [
  {
    keys: ["hello", "hi", "hey", "ayubowan", "හායි", "හෙලෝ", "ආයුබෝවන්"],
    en: "Hi! Welcome to PASIYA MAX // CMD. Ask about Agent Workspace, Virtual PC, Hosting, Web Studio, and more.",
    si: "ආයුබෝවන්! PASIYA MAX // CMD වෙත සාදරයෙන් පිළිගනිමු. Agent Workspace, Virtual PC, Hosting, Web Studio වගේ සේවා ගැන අහන්න පුළුවන්.",
  },
  {
    keys: ["agent", "workspace", "gemini", "coding", "ගැනට්", "ඒජන්ට්"],
    en: "Agent Workspace (/agent) is our coding AI agent. It can work with GitHub files. Admin can turn it ON/OFF to save free AI quota. Open: sidebar → Agent Workspace.",
    si: "Agent Workspace (/agent) කියන්නේ coding AI agent එකයි. GitHub files සමඟ වැඩ කරන්න පුළුවන්. Adminට ON/OFF කරලා free AI quota රැකගන්න පුළුවන්. Sidebar → Agent Workspace.",
  },
  {
    keys: ["virtual", "pc", "computer", "වර්චුවල්"],
    en: "Virtual PC is a dashboard tool for dev-style workflows. Open: sidebar → Virtual PC (/virtual-pc).",
    si: "Virtual PC කියන්නේ dashboard එකේ dev-style tool එකක්. Sidebar → Virtual PC (/virtual-pc).",
  },
  {
    keys: ["host", "hosting", "database", "db", "supabase", "vercel", "හොස්ට්"],
    en: "Hosting · DB links Vercel, Supabase, GitHub and related dashboards. Open: sidebar → Hosting · DB (/hosting).",
    si: "Hosting · DB කියන්නේ Vercel, Supabase, GitHub වගේ stack links. Sidebar → Hosting · DB (/hosting).",
  },
  {
    keys: ["web studio", "studio", "design", "වෙබ් ස්ටුඩියෝ"],
    en: "Web Studio is the creative/build area. Open: sidebar → Web Studio (/web-studio).",
    si: "Web Studio කියන්නේ web build/creative කොටස. Sidebar → Web Studio (/web-studio).",
  },
  {
    keys: ["social", "instagram", "facebook", "youtube", "tiktok", "සෝෂල්"],
    en: "Social Nexus has social links and related tools. Open: sidebar → Social Nexus (/social).",
    si: "Social Nexus එකේ social links සහ tools තියෙනවා. Sidebar → Social Nexus (/social).",
  },
  {
    keys: ["analytics", "stats", "traffic", "ඇනලිටික්ස්"],
    en: "Analytics shows platform metrics. Open: sidebar → Analytics (/analytics).",
    si: "Analytics එකේ platform metrics තියෙනවා. Sidebar → Analytics (/analytics).",
  },
  {
    keys: ["finance", "money", "billing", "මුදල්", "ගාස්තු"],
    en: "Finance Center is the billing/money panel. Open: sidebar → Finance (/finance).",
    si: "Finance Center කියන්නේ මුදල්/billing panel එක. Sidebar → Finance (/finance).",
  },
  {
    keys: ["security", "password", "2fa", "ආරක්ෂා"],
    en: "Security Center covers access and safety tools. Open: sidebar → Security (/security).",
    si: "Security Center එකේ ආරක්ෂා/access tools තියෙනවා. Sidebar → Security (/security).",
  },
  {
    keys: ["storage", "file", "upload", "cloud", "ගබඩා"],
    en: "Cloud Storage is the files panel. Open: sidebar → Cloud Storage (/storage).",
    si: "Cloud Storage කියන්නේ files panel එක. Sidebar → Cloud Storage (/storage).",
  },
  {
    keys: ["team", "member", "invite", "කණ්ඩායම"],
    en: "Team is for collaboration/members. Open: sidebar → Team (/team).",
    si: "Team කියන්නේ collaboration/members කොටස. Sidebar → Team (/team).",
  },
  {
    keys: ["automation", "n8n", "workflow", "ස්වයං"],
    en: "Automation Lab is for workflow automation. Site chat is built-in (no n8n required). Open: sidebar → Automation Lab (/automation).",
    si: "Automation Lab workflow automation සඳහායි. Site chat දැන් built-in (n8n ඕනේ නැහැ). Sidebar → Automation Lab (/automation).",
  },
  {
    keys: ["marketplace", "apps", "plugin", "වෙළඳ"],
    en: "Marketplace lists apps/widgets. Open: sidebar → Marketplace (/marketplace).",
    si: "Marketplace එකේ apps/widgets. Sidebar → Marketplace (/marketplace).",
  },
  {
    keys: ["setting", "config", "සැකසුම්"],
    en: "Settings manages dashboard preferences. Open: sidebar → Settings (/settings).",
    si: "Settings එකෙන් dashboard preferences. Sidebar → Settings (/settings).",
  },
  {
    keys: ["price", "cost", "free", "මිල", "ගාන", "නොමිලේ"],
    en: "PASIYA MAX is your SaaS dashboard on Vercel. Some AI features use free API limits; admin can turn Agent OFF to save quota.",
    si: "PASIYA MAX කියන්නේ Vercel මත ඔබේ SaaS dashboard එකයි. සමහර AI features free limits use කරනවා; Adminට Agent OFF කරලා quota රැකගන්න පුළුවන්.",
  },
  {
    keys: ["contact", "support", "help", "උදව්", "සහාය"],
    en: "This is the on-site helper bot. Use the sidebar for services. For coding tasks, open Agent Workspace when the admin has turned it ON.",
    si: "මේක site helper bot එකයි. Services සඳහා sidebar use කරන්න. Coding වැඩට Admin ON කරලා තියෙනවා නම් Agent Workspace open කරන්න.",
  },
  {
    keys: ["what is", "pasiya", "about", "මොකක්ද", "platform", "වේදිකා"],
    en: "PASIYA MAX // CMD is a command dashboard: Virtual PC, Agent Workspace (AI), Web Studio, Hosting/DB, Social, Analytics, Finance, Team, Automation, Storage, Security, Marketplace, Settings.",
    si: "PASIYA MAX // CMD කියන්නේ command dashboard එකක්: Virtual PC, Agent Workspace (AI), Web Studio, Hosting/DB, Social, Analytics, Finance, Team, Automation, Storage, Security, Marketplace, Settings — එක තැනක.",
  },
];

function replyFor(message: string): string {
  const q = message.toLowerCase();
  const si = isSinhala(message);
  const hits: { score: number; en: string; si: string }[] = [];

  for (const row of KNOWLEDGE) {
    let score = 0;
    for (const k of row.keys) {
      if (q.includes(k.toLowerCase())) score += 1;
    }
    if (score > 0) hits.push({ score, en: row.en, si: row.si });
  }

  hits.sort((a, b) => b.score - a.score);
  if (hits[0]) return si ? hits[0].si : hits[0].en;

  return si
    ? "මට PASIYA MAX සේවා ගැන උදව් කරන්න පුළුවන්: Agent, Virtual PC, Web Studio, Hosting, Social, Analytics, Finance, Team, Automation, Storage, Security, Marketplace, Settings. උදා: “Agent Workspace මොකක්ද?”"
    : "I can help with PASIYA MAX services: Agent, Virtual PC, Web Studio, Hosting, Social, Analytics, Finance, Team, Automation, Storage, Security, Marketplace, Settings. Try: “What is Agent Workspace?”";
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

  return Response.json({ reply: replyFor(message) });
} 
