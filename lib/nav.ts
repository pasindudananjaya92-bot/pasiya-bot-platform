export type NavItem = {
  href: string;
  label: string;
  icon: string;
  group?: string;
};

export const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: "⌂", group: "Main" },
  { href: "/virtual-pc", label: "Virtual PC", icon: "💻", group: "Main" },
  { href: "/ai-agent", label: "AI Agent", icon: "🤖", group: "Main" },
  { href: "/web-studio", label: "Web Studio", icon: "✨", group: "Main" },
  { href: "/hosting", label: "Hosting · DB", icon: "☁", group: "Platform" },
  { href: "/developer", label: "Developer", icon: "⚙", group: "Platform" },
  { href: "/social", label: "Social Nexus", icon: "📡", group: "Platform" },
  { href: "/analytics", label: "Analytics", icon: "📊", group: "Pro" },
  { href: "/finance", label: "Finance", icon: "💰", group: "Pro" },
  { href: "/team", label: "Team", icon: "👥", group: "Pro" },
  { href: "/automation", label: "Automation Lab", icon: "⚡", group: "Pro" },
  { href: "/storage", label: "Cloud Storage", icon: "🗄", group: "Pro" },
  { href: "/security", label: "Security", icon: "🔒", group: "Pro" },
  { href: "/marketplace", label: "Marketplace", icon: "🛒", group: "Pro" },
  { href: "/settings", label: "Settings", icon: "⚙", group: "System" },
];
