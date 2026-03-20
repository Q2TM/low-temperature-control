import Link from "next/link";

import { ThemeToggle } from "../theme/ThemeToggle";

export function NavBar() {
  return (
    <nav className="m-3 rounded-full border-2 border-border/50 bg-card/20 backdrop-blur-xs py-2 px-6 shadow-xl sticky top-3 max-w-5xl mx-auto z-40">
      <div className="flex flex-row items-center justify-between gap-3">
        <Link href="/" className="text-lg sm:text-xl font-semibold">
          Dashboard
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
