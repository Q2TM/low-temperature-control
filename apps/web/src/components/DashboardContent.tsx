"use client";

import { FileWarning, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@repo/ui/base/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/base/card";
import { Spinner } from "@repo/ui/base/spinner";

import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { useTempMetrics } from "@/hooks/useTempMetrics";

type DashboardContentProps = {
  nMinutes: number;
  heaterCards: React.ReactNode;
};

export function DashboardContent({
  nMinutes,
  heaterCards,
}: DashboardContentProps) {
  const [timeEnd, setTimeEnd] = useState<number>(() => Date.now());
  const timeStart = useMemo(
    () => timeEnd - nMinutes * 60 * 1000,
    [timeEnd, nMinutes],
  );

  const metrics = useTempMetrics({
    interval: 1,
    timeStart,
    timeRange: nMinutes * 60 * 1000,
    channels: [1],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeEnd(Date.now());
    }, 10_000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return <Spinner />;
  }

  const { channels, chartData } = metrics;
  const channel1Data = channels[1];
  const currentTemp = channel1Data?.currentTemp ?? null;
  const tempChange = channel1Data?.tempChange ?? null;
  const avgTemp = channel1Data?.avgTemp ?? null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription className="text-lg">
              Current Temperature
            </CardDescription>
            <CardTitle className="text-2xl">
              {currentTemp !== null ? currentTemp.toFixed(2) : "--"} °C
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {tempChange === null || Number.isNaN(tempChange) ? (
                  <FileWarning />
                ) : tempChange >= 0 ? (
                  <TrendingUp />
                ) : (
                  <TrendingDown />
                )}
                {tempChange === null || Number.isNaN(tempChange)
                  ? "--"
                  : tempChange.toFixed(2)}
                %
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Average Temperature Past {nMinutes} Minutes
            </div>
            <div className="text-muted-foreground">
              {avgTemp !== null ? avgTemp.toFixed(2) : "--"} °C
            </div>
          </CardFooter>
        </Card>

        {heaterCards}
      </div>

      <TemperatureChart data={chartData} nMinutes={nMinutes} />
    </>
  );
}
