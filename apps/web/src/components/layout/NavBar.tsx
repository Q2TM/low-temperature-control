"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";

import { Button } from "@repo/ui/atom/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/molecule/dropdown-menu";
import { cn } from "@repo/ui/utils";

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
  const [open, setOpen] = useState(false);

  const dashboardHref = currentSystemId ? `/${currentSystemId}` : "/";
  const curveHref = currentSystemId ? `/${currentSystemId}/curve` : "/";
  const experimentsHref = currentSystemId
    ? `/${currentSystemId}/experiments`
    : null;
  const hasSystemSwitcher = Boolean(
    systems && systems.length > 0 && currentSystemId,
  );

  const closeMenu = () => setOpen(false);

  const navLinks = (
    <>
      {experimentsHref && (
        <Link
          href={experimentsHref}
          onClick={closeMenu}
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          Experiments
        </Link>
      )}
      <Link
        href={curveHref}
        onClick={closeMenu}
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Thermo Device
      </Link>
      <Link
        href="/admin/systems"
        onClick={closeMenu}
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Systems
      </Link>
    </>
  );

  return (
    <nav className="mx-4 my-3 md:mx-auto rounded-3xl md:rounded-full border-2 border-border/50 bg-card/20 backdrop-blur-xs py-2 px-4 sm:px-6 shadow-xl sticky top-3 max-w-5xl z-40">
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">
        <Link
          href={dashboardHref}
          onClick={closeMenu}
          className="text-lg sm:text-xl font-semibold"
        >
          Dashboard
        </Link>

        <div className="flex flex-row items-center gap-2 sm:gap-4 md:gap-6">
          {hasSystemSwitcher && (
            <Suspense>
              <SystemSwitcher
                systems={systems!}
                currentSystemId={currentSystemId!}
              />
            </Suspense>
          )}

          <div className="hidden md:flex flex-row items-center gap-6">
            {navLinks}
          </div>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="sm:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Open menu"
                className="hidden sm:inline-flex md:hidden"
              >
                <Menu className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={12}>
              {experimentsHref && (
                <DropdownMenuItem asChild>
                  <Link href={experimentsHref}>Experiments</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={curveHref}>Thermo Device</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/systems">Systems</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        className={cn(
          "sm:hidden grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex flex-col gap-4">
              {navLinks}
              <div className="pt-1">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
