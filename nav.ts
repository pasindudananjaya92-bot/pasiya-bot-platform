export type NavItem = {
  href: string;
  label: string;
  icon: string;
  group?: string;
};

export const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: "LayoutDashboard", group: "Main" },
  { href: "/virtual-pc", label: "Virtual PC", icon: "Monitor", group: "Main" },
  { href: "/ai-agent", label: "AI Agent", icon: "Bot", group: "Main" },
  { href: "/web-studio", label: "Web Studio", icon: "Code2", group: "Main" },
  { href: "/hosting", label: "Hosting & DB", icon: "Server", group: "Platform" },
  { href: "/developer", label: "Developer", icon: "Terminal", group: "Platform" },
  { href: "/social", label: "Social Nexus", icon: "Share2", group: "Platform" },
  { href: "/analytics", label: "Analytics", icon: "BarChart3", group: "Pro" },
  { href: "/finance", label: "Finance", icon: "Wallet", group: "Pro" },
  { href: "/team", label: "Team", icon: "Users", group: "Pro" },
  { href: "/automation", label: "Automation Lab", icon: "Workflow", group: "Pro" },
  { href: "/storage", label: "Cloud Storage", icon: "HardDrive", group: "Pro" },
  { href: "/security", label: "Security", icon: "Shield", group: "Pro" },
  { href: "/marketplace", label: "Marketplace", icon: "Store", group: "Pro" },
  { href: "/settings", label: "Settings", icon: "Settings", group: "System" }
];
