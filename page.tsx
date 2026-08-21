import { ServiceGrid } from "@/components/ServiceGrid";
const items = [
  { name: "Instagram", href: "https://www.instagram.com/pasindu5598", desc: "@pasindu5598" },
  { name: "Facebook", href: "https://www.facebook.com/share/18xRGhYVUo/", desc: "Page" },
  { name: "YouTube", href: "https://youtube.com/@pasya", desc: "@pasya" },
  { name: "TikTok", href: "https://tiktok.com/@pasindudananjaya619", desc: "TikTok" },
  { name: "X / Twitter", href: "https://x.com/PasinduDan98554", desc: "X profile" },
  { name: "Telegram", href: "https://t.me/goldenbotmdchannel", desc: "Channel" },
  { name: "LinkedIn", href: "https://linkedin.com/in/pasindu-dananjaya-41044831b", desc: "Profile" },
  { name: "GitHub", href: "https://github.com/pasindudananjaya92-bot", desc: "Repos" }
];
export default function SocialPage() {
  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="text-xl font-bold text-white">Social Nexus</h1>
      <ServiceGrid items={items} />
    </div>
  );
}
