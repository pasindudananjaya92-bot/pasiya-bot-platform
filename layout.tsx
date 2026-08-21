import type { Metadata } from "next";
import "./globals.css";
import { DashboardShell } from "@/components/DashboardShell";

export const metadata: Metadata = {
  title: "PASiYA MAX // CMD",
  description: "Professional SaaS command center — Virtual PC, AI, Hosting, Analytics"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
