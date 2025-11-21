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
import { DashboardControls } from "@/components/DashboardControls";
import HeaterCards from "@/components/HeaterCards";
import { useHeaterMetrics } from "@/hooks/useHeaterMetrics";
import { useTempMetrics } from "@/hooks/useTempMetrics";

type DashboardContentProps = {
  initialTargetTemp: number | null;
};

export function DashboardContent({ initialTargetTemp }: DashboardContentProps) {
  const [timeEnd, setTimeEnd] = useState<number>(() => Date.now());
  const [selectedPin, setSelectedPin] = useState<number>(18);
  const [timeRange, setTimeRange] = useState<number>(10); // minutes
  const [timeInterval, setTimeInterval] = useState<number>(1); // seconds
  const [refreshInterval, setRefreshInterval] = useState<number>(10000); // ms

  const timeStart = useMemo(
    () => timeEnd - timeRange * 60 * 1000,
    [timeEnd, timeRange],
  );

  const tempMetrics = useTempMetrics({
    interval: timeInterval,
    timeStart,
    timeRange: timeRange * 60 * 1000,
    channels: [1],
  });

  const heaterMetrics = useHeaterMetrics({
    interval: timeInterval,
    timeStart,
    timeRange: timeRange * 60 * 1000,
    pins: [selectedPin],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeEnd(Date.now());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (!tempMetrics || !heaterMetrics) {
    return <Spinner />;
  }

  const { channels: tempChannels, chartData: tempChartData } = tempMetrics;
  const { pins: heaterPins, chartData: heaterChartData } = heaterMetrics;

  const channel1Data = tempChannels[1];
  const currentTemp = channel1Data?.currentTemp ?? null;
  const tempChange = channel1Data?.tempChange ?? null;
  const avgTemp = channel1Data?.avgTemp ?? null;

  const heaterPinData = heaterPins[selectedPin];
  const heaterCardData = heaterPinData
    ? {
        currentPower: heaterPinData.currentPower,
        dutyCycle: heaterPinData.currentDutyCycle,
        totalEnergy: heaterPinData.totalEnergy,
      }
    : null;

  // Merge temperature and heater chart data
  const combinedChartData = tempChartData.map((tempEntry) => {
    const heaterEntry = heaterChartData.find((h) => h.time === tempEntry.time);
    return {
      ...tempEntry,
      ...(heaterEntry || {}),
    };
  });

  return (
    <>
      <DashboardControls
        selectedPin={selectedPin}
        onPinChange={setSelectedPin}
        timeInterval={timeInterval}
        onTimeIntervalChange={setTimeInterval}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

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
              Average Temperature Past {timeRange} Minutes
            </div>
            <div className="text-muted-foreground">
              {avgTemp !== null ? avgTemp.toFixed(2) : "--"} °C
            </div>
          </CardFooter>
        </Card>

        <HeaterCards
          nMinutes={timeRange}
          heaterStatus={heaterCardData}
          targetTemp={initialTargetTemp}
        />
      </div>

      <TemperatureChart data={combinedChartData} nMinutes={timeRange} />
    </>
  );
}
