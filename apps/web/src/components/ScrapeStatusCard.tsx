"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@repo/ui/atom/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@repo/ui/molecule/card";

import { getScrapeStatus } from "@/actions/riceShower";

type WindowedStats = {
  successLast1M: number;
  successLast10M: number;
  successTotal: number;
  errorsLast1M: number;
  errorsLast10M: number;
  errorsTotal: number;
  lastError?: string | null;
  lastErrorMessage?: string | null;
};

type ScrapeStatus = {
  thermo: WindowedStats;
  heater: WindowedStats;
  startedAt: string;
};

type ScrapeStatusCardProps = {
  systemId: string;
};

const REFRESH_INTERVAL_MS = 5000;

function StatsRow({
  label,
  stats,
}: {
  label: string;
  stats: WindowedStats;
}) {
  const hasRecentErrors = stats.errorsLast1M > 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {hasRecentErrors ? (
          <Badge variant="destructive" className="text-xs">
            Errors
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs text-green-600 border-green-600"
          >
            OK
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 text-xs">
        <div className="text-center">
          <div className="text-muted-foreground">1m</div>
          <div className="font-mono tabular-nums">
            <span className="text-green-600">{stats.successLast1M}</span>
            {" / "}
            <span className={stats.errorsLast1M > 0 ? "text-red-500" : ""}>
              {stats.errorsLast1M}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">10m</div>
          <div className="font-mono tabular-nums">
            <span className="text-green-600">{stats.successLast10M}</span>
            {" / "}
            <span className={stats.errorsLast10M > 0 ? "text-red-500" : ""}>
              {stats.errorsLast10M}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Total</div>
          <div className="font-mono tabular-nums">
            <span className="text-green-600">{stats.successTotal}</span>
            {" / "}
            <span className={stats.errorsTotal > 0 ? "text-red-500" : ""}>
              {stats.errorsTotal}
            </span>
          </div>
        </div>
      </div>

      {stats.lastErrorMessage && (
        <p
          className="text-xs text-red-500 truncate"
          title={stats.lastErrorMessage}
        >
          {stats.lastErrorMessage}
        </p>
      )}
    </div>
  );
}

export function ScrapeStatusCard({ systemId }: ScrapeStatusCardProps) {
  const [status, setStatus] = useState<ScrapeStatus | null>(null);

  const refresh = useCallback(async () => {
    const data = await getScrapeStatus(systemId);
    if (data) {
      setStatus(data);
    }
  }, [systemId]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardDescription className="text-lg">Scrape Status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const overallOk =
    status.thermo.errorsLast1M === 0 && status.heater.errorsLast1M === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription className="text-lg">Scrape Status</CardDescription>
          {overallOk ? (
            <Badge
              variant="outline"
              className="text-xs text-green-600 border-green-600"
            >
              Healthy
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              Degraded
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Since {new Date(status.startedAt).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          Success / Error counts
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <StatsRow label="Thermometer" stats={status.thermo} />
        <StatsRow label="Heater" stats={status.heater} />
      </CardContent>
    </Card>
  );
}
