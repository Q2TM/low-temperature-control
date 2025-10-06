import Link from "next/link";

import { ThemeToggle } from "../theme/ThemeToggle";

export function NavBar() {
  return (
    <nav className="m-4 rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-2xl py-4 px-8 shadow-xl sticky top-4 max-w-5xl mx-auto">
      <div className="flex flex-row items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold">
          Almond Dashboard
        </Link>

        <div className="flex flex-row justify-end gap-4">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
