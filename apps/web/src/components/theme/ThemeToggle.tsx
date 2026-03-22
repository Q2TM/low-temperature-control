"use client";

import { Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useId, useSyncExternalStore } from "react";

import { Button } from "@repo/ui/atom/button";
import { cn } from "@repo/ui/utils";

import styles from "./ThemeToggle.module.css";

function ToggleSvg() {
  const uid = useId();
  const moonGlowId = `${uid}-moon-glow`;
  const clipId = `${uid}-toggle-clip`;
  const maskId = `${uid}-crescent-mask`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 80"
      className={styles.toggle}
      aria-hidden
    >
      <defs>
        <filter id={moonGlowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="160" height="80" rx="40" />
        </clipPath>
        <mask id={maskId}>
          <circle cx="40" cy="40" r="16" fill="white" />
          <circle cx="46" cy="34" r="14" fill="black" />
        </mask>
      </defs>

      <rect
        x="0"
        y="0"
        width="160"
        height="80"
        rx="40"
        className={styles.toggleBg}
      />

      <g clipPath={`url(#${clipId})`}>
        <g className={styles.stars} fill="#FFFFFF">
          <circle cx="40" cy="25" r="1.5" />
          <circle cx="65" cy="45" r="2.5" />
          <circle cx="30" cy="60" r="1" />
          <circle cx="80" cy="20" r="1.5" />
          <circle cx="95" cy="55" r="2" />
          <circle cx="55" cy="70" r="1" />
        </g>
        <g className={styles.clouds} fill="#FFFFFF" opacity="0.9">
          <circle cx="100" cy="75" r="20" />
          <circle cx="130" cy="80" r="25" />
          <circle cx="155" cy="65" r="18" />
          <circle cx="75" cy="85" r="15" />
        </g>
      </g>

      <g className={styles.slider}>
        <circle
          cx="40"
          cy="40"
          r="32"
          fill="#000000"
          opacity="0.1"
          transform="translate(0, 4)"
        />
        <circle cx="40" cy="40" r="32" fill="#FFFFFF" />

        <g className={styles.sunIcon}>
          <circle cx="40" cy="40" r="11" fill="#F59E0B" />
          <g stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round">
            <line x1="40" y1="16" x2="40" y2="21" />
            <line x1="40" y1="59" x2="40" y2="64" />
            <line x1="16" y1="40" x2="21" y2="40" />
            <line x1="59" y1="40" x2="64" y2="40" />
            <line x1="23" y1="23" x2="26.5" y2="26.5" />
            <line x1="53.5" y1="53.5" x2="57" y2="57" />
            <line x1="23" y1="57" x2="26.5" y2="53.5" />
            <line x1="53.5" y1="26.5" x2="57" y2="23" />
          </g>
        </g>

        <g className={styles.moonIcon}>
          <circle
            cx="40"
            cy="40"
            r="18"
            fill="#FDE047"
            filter={`url(#${moonGlowId})`}
            className={styles.moonGlow}
          />
          <circle
            cx="40"
            cy="40"
            r="16"
            fill="#FBBF24"
            mask={`url(#${maskId})`}
          />
        </g>
      </g>
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const handleToggle = () => {
    if (!mounted || resolvedTheme === undefined) return;
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleAutoClick = () => {
    if (!mounted) return;
    if (theme === "system") {
      setTheme(resolvedTheme ?? "light");
    } else {
      setTheme("system");
    }
  };

  const isAuto = mounted && theme === "system";

  return (
    <div className={styles.wrapper} role="group" aria-label="Theme appearance">
      <div className={styles.toggleSegment}>
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Toggle color scheme"
          title="Toggle theme"
          className={styles.toggleButton}
        >
          <ToggleSvg />
        </button>
      </div>

      <div className={styles.divider} aria-hidden />
      <div className={styles.systemControl}>
        <Button
          type="button"
          variant={isAuto ? "default" : "ghost"}
          size="icon-sm"
          className={cn("size-8 shrink-0 rounded-full")}
          onClick={handleAutoClick}
          aria-label={isAuto ? "Using system theme" : "Use system theme"}
          title={isAuto ? "Using system theme" : "Use system theme"}
        >
          <Monitor className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
