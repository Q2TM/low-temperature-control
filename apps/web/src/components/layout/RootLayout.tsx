import { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

import { NavBar } from "./NavBar";
import Providers from "./Providers";

type RootLayoutProps = {
  children: ReactNode;
};

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <Providers>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NavBar />
        {children}
      </ThemeProvider>{" "}
    </Providers>
  );
}
