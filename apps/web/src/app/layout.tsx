import "@repo/ui/globals.css";

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { RootLayout } from "@/components/layout/RootLayout";

export const metadata: Metadata = {
  title: "Almond Dashboard",
  description: "Dashboard for Low Temperature Control System",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
