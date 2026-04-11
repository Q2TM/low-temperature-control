import { ReactNode } from "react";

import { Toaster } from "@repo/ui/molecule/sonner";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

import Providers from "./Providers";

type RootLayoutProps = {
  children: ReactNode;
};

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <Providers>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster />
      </ThemeProvider>
    </Providers>
  );
}
