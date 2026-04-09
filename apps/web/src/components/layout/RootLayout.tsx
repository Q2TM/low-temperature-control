import { ReactNode } from "react";

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
      </ThemeProvider>
    </Providers>
  );
}
