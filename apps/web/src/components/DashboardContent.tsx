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

import {
  getHeaterConfig,
  getHeaterStatus,
  getPIDParameters,
} from "@/actions/heater";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { DashboardControls } from "@/components/DashboardControls";
import HeaterControl from "@/components/HeaterControl";
import { useHeaterMetrics } from "@/hooks/useHeaterMetrics";
import { useTempMetrics } from "@/hooks/useTempMetrics";

type DashboardContentProps = {
  initialTargetTemp: number | null;
  initialIsActive: boolean;
  initialPidParameters: {
    kp: number;
    ki: number;
    kd: number;
  } | null;
};

export function DashboardContent({
  initialTargetTemp,
  initialIsActive,
  initialPidParameters,
}: DashboardContentProps) {
  const [timeEnd, setTimeEnd] = useState<number>(() => Date.now());
  const [selectedPin, setSelectedPin] = useState<number>(18);
  const [timeRange, setTimeRange] = useState<number>(10); // minutes
  const [timeInterval, setTimeInterval] = useState<number>(1); // seconds
  const [refreshInterval, setRefreshInterval] = useState<number>(10000); // ms
  const [targetTemp, setTargetTemp] = useState(initialTargetTemp);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [pidParameters, setPidParameters] = useState(initialPidParameters);

  const handleStatusRefresh = async () => {
    // Re-fetch heater status and config from server
    const [config, status, params] = await Promise.all([
      getHeaterConfig(),
      getHeaterStatus(),
      getPIDParameters(),
    ]);

    if (config) setTargetTemp(config.targetTemp ?? null);
    if (status) setIsActive(status.isActive);
    if (params) setPidParameters(params);

    // Also trigger data refresh
    setTimeEnd(Date.now());
  };

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
      <aside className="dashboard-sidebar">
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold">Lab 20-05</h1>
          <p className="text-sm text-muted-foreground">
            20th Floor, Building 4
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">PID Controller</h2>
            <HeaterControl
              targetTemp={targetTemp}
              isActive={isActive}
              pidParameters={pidParameters}
              onStatusChange={handleStatusRefresh}
            />
          </div>

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

          <Card>
            <CardHeader>
              <CardDescription className="text-lg">
                Current Heat Power
              </CardDescription>
              <CardTitle className="text-2xl">
                {heaterCardData?.currentPower !== null &&
                heaterCardData?.currentPower !== undefined
                  ? heaterCardData.currentPower.toFixed(2)
                  : "--"}{" "}
                W
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  {heaterCardData?.dutyCycle !== null &&
                  heaterCardData?.dutyCycle !== undefined
                    ? `${(heaterCardData.dutyCycle * 100).toFixed(0)}%`
                    : "--"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Energy Past {timeRange} Minutes
              </div>
              <div className="text-muted-foreground">
                {heaterCardData?.totalEnergy !== null &&
                heaterCardData?.totalEnergy !== undefined
                  ? `${heaterCardData.totalEnergy.toFixed(0)} J (${(heaterCardData.totalEnergy / 3600).toFixed(2)} Wh)`
                  : "-- J (-- Wh)"}
              </div>
            </CardFooter>
          </Card>
        </div>
      </aside>

      <div className="dashboard-content">
        <div className="mb-4">
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
        </div>
        <TemperatureChart data={combinedChartData} nMinutes={timeRange} />
      </div>
    </>
  );
}
