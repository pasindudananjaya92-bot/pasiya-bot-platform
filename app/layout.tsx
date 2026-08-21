import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PASiYA MAX // CMD",
  description: "SaaS Dashboard — Step 1 base",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg antialiased">{children}</body>
    </html>
  );
} 
