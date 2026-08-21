import { ServiceGrid } from "@/components/ServiceGrid";
const items = [
  { name: "Vercel", href: "https://vercel.com", desc: "Deploy frontend & serverless", tag: "Hosting" },
  { name: "GitHub", href: "https://github.com/pasindudananjaya92-bot/pasiya-bot-platform", desc: "Source control", tag: "Git" },
  { name: "Replit", href: "https://replit.com", desc: "Cloud IDE & host", tag: "IDE" },
  { name: "Supabase", href: "https://supabase.com/dashboard", desc: "Auth · DB · Storage", tag: "Backend" },
  { name: "MongoDB Atlas", href: "https://cloud.mongodb.com", desc: "Document DB + Search", tag: "DB" },
  { name: "n8n Cloud", href: "https://pasiyamax.app.n8n.cloud", desc: "Workflow automation", tag: "Auto" },
  { name: "Railway", href: "https://railway.app", desc: "Containers & DBs", tag: "Host" },
  { name: "Render", href: "https://render.com", desc: "Web services", tag: "Host" }
];
export default function HostingPage() {
  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="text-xl font-bold text-white">Hosting · DB · Backend</h1>
      <p className="text-sm text-muted">Platform services for deploy, data, and automation.</p>
      <ServiceGrid items={items} />
    </div>
  );
}
