import Link from "next/link";

import { ThemeToggle } from "../theme/ThemeToggle";

export function NavBar() {
  return (
    <nav className="m-4 rounded-full border-2 border-border/50 bg-card/20 backdrop-blur-xs py-4 px-8 shadow-xl sticky top-4 max-w-5xl mx-auto z-90">
      <div className="flex flex-row items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold">
          Almond Dashboard
        </Link>

        <div className="flex flex-row items-center gap-6">
          <Link
            href="/curve"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Curve Editor
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
