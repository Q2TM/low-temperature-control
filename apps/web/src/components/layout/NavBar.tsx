import Link from "next/link";
import { Suspense } from "react";

import { SystemSwitcher } from "@/components/SystemSwitcher";

import { ThemeToggle } from "../theme/ThemeToggle";

type SystemForNav = {
  id: string;
  displayName: string;
};

type NavBarProps = {
  systems?: SystemForNav[];
  currentSystemId?: string;
};

export function NavBar({ systems, currentSystemId }: NavBarProps) {
  const curveHref = currentSystemId ? `/${currentSystemId}/curve` : "/";

  return (
    <nav className="m-3 rounded-full border-2 border-border/50 bg-card/20 backdrop-blur-xs py-2 px-6 shadow-xl sticky top-3 max-w-5xl mx-auto z-40">
      <div className="flex flex-row items-center justify-between gap-3">
        <Link href="/" className="text-lg sm:text-xl font-semibold">
          Dashboard
        </Link>

        <div className="flex flex-row items-center gap-6">
          {systems && systems.length > 0 && currentSystemId && (
            <Suspense>
              <SystemSwitcher
                systems={systems}
                currentSystemId={currentSystemId}
              />
            </Suspense>
          )}
          <Link
            href={curveHref}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Curve Editor
          </Link>
          <Link
            href="/admin/systems"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Systems
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
