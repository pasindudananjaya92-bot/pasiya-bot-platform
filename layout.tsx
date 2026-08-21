import type { Metadata } from "next";
import "./globals.css";
import { DashboardShell } from "@/components/DashboardShell";

export const metadata: Metadata = {
  title: "PASiYA MAX // CMD",
  description: "Professional SaaS Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
