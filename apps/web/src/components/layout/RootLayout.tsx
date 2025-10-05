import { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

import { NavBar } from "./NavBar";

type RootLayoutProps = {
  children: ReactNode;
};

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NavBar />
      {children}
    </ThemeProvider>
  );
}
