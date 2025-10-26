"use client";
import { useEffect } from "react";

type AutoRefreshProps = {
  intervalMs?: number;
};

export default function AutoRefresh({ intervalMs = 5000 }: AutoRefreshProps) {
  useEffect(() => {
    const id = setInterval(() => window.location.reload(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return null;
}
