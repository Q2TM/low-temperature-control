"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Spinner } from "@repo/ui/icon/spinner";

import { getHeaterStatus, getPIDParameters } from "@/actions/heater";
import { getLakeshoreTemperatureCelsius } from "@/actions/lakeshore";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { DashboardControls } from "@/components/DashboardControls";
import { PeriodSummaryCard } from "@/components/PeriodSummaryCard";
import {
  PidControllerCard,
  type PidRuntimeState,
} from "@/components/PidControllerCard";
import { useHeaterMetrics } from "@/hooks/useHeaterMetrics";
import { useTempMetrics } from "@/hooks/useTempMetrics";
import { LAKESHORE_SENSOR_CHANNEL_TEMP } from "@/libs/tempConfig";
import {
  formatTimeframeLabel,
  getAvailableResolutions,
  getTimeSpanMs,
  type TimeRange,
} from "@/libs/timeConfig";

const PID_STATUS_REFRESH_MS = 1000;

type DashboardContentProps = {
  initialCurrentTemp: number | null;
  initialTargetTemp: number | null;
  initialIsActive: boolean;
  initialPidParameters: {
    kp: number;
    ki: number;
    kd: number;
  } | null;
  initialPidRuntimeState: PidRuntimeState | null;
};

export function DashboardContent({
  initialCurrentTemp,
  initialTargetTemp,
  initialIsActive,
  initialPidParameters,
  initialPidRuntimeState,
}: DashboardContentProps) {
  const [timeEnd, setTimeEnd] = useState<number>(() => Date.now());
  const [selectedPin, setSelectedPin] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    mode: "relative",
    minutes: 10,
  });
  const [timeInterval, setTimeInterval] = useState<number>(1); // seconds
  const [refreshInterval, setRefreshInterval] = useState<number>(10000); // ms
  const [currentTemp, setCurrentTemp] = useState(initialCurrentTemp);
  const [targetTemp, setTargetTemp] = useState(initialTargetTemp);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [pidParameters, setPidParameters] = useState(initialPidParameters);
  const [pidRuntimeState, setPidRuntimeState] =
    useState<PidRuntimeState | null>(initialPidRuntimeState);

  const spanMs = getTimeSpanMs(timeRange);

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    const newSpanMs = getTimeSpanMs(newRange);
    const { available, defaultResolution } = getAvailableResolutions(newSpanMs);
    setTimeInterval((prev) => {
      const isValid = available.some((r) => r.value === prev);
      return isValid ? prev : defaultResolution.value;
    });
  };

  const refreshPidStatus = useCallback(async () => {
    const [status, params, lakeshoreTemp] = await Promise.all([
      getHeaterStatus(1),
      getPIDParameters(1),
      getLakeshoreTemperatureCelsius(LAKESHORE_SENSOR_CHANNEL_TEMP),
    ]);

    if (status) {
      setCurrentTemp(lakeshoreTemp ?? status.currentTemp ?? null);
      setTargetTemp(status.target);
      setIsActive(status.isActive);
      setPidRuntimeState({
        power: status.power,
        maxHeaterPowerWatts: status.maxHeaterPowerWatts,
        startedAt: status.startedAt,
        runningForSeconds: status.runningForSeconds,
        pidVariables: status.pidVariables,
        errorStats: status.errorStats,
      });
    }
    if (params) setPidParameters(params);
  }, []);

  const handleStatusRefresh = async () => {
    await refreshPidStatus();
    setTimeEnd(Date.now());
  };

  const effectiveEnd = useMemo(
    () => (timeRange.mode === "relative" ? timeEnd : timeRange.end),
    [timeRange, timeEnd],
  );
  const effectiveStart = useMemo(
    () => effectiveEnd - spanMs,
    [effectiveEnd, spanMs],
  );

  const tempMetrics = useTempMetrics({
    interval: timeInterval,
    timeStart: effectiveStart,
    timeRange: spanMs,
    channels: [LAKESHORE_SENSOR_CHANNEL_TEMP],
  });

  const heaterMetrics = useHeaterMetrics({
    interval: timeInterval,
    timeStart: effectiveStart,
    timeRange: spanMs,
    pins: [selectedPin],
  });

  useEffect(() => {
    const id = setInterval(() => {
      void refreshPidStatus();
    }, PID_STATUS_REFRESH_MS);
    return () => clearInterval(id);
  }, [refreshPidStatus]);

  useEffect(() => {
    if (refreshInterval <= 0) {
      return;
    }

    const interval = setInterval(() => {
      if (timeRange.mode === "relative") {
        setTimeEnd(Date.now());
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, timeRange.mode]);

  if (!tempMetrics || !heaterMetrics) {
    return <Spinner />;
  }

  const { channels: tempChannels, chartData: tempChartData } = tempMetrics;
  const { pins: heaterPins, chartData: heaterChartData } = heaterMetrics;

  const channel1Data = tempChannels[LAKESHORE_SENSOR_CHANNEL_TEMP];
  const avgTemp = channel1Data?.avgTemp ?? null;

  const heaterPinData = heaterPins[selectedPin];

  const combinedChartData = tempChartData.map((tempEntry) => {
    const heaterEntry = heaterChartData.find((h) => h.time === tempEntry.time);
    return {
      ...tempEntry,
      ...(heaterEntry || {}),
    };
  });

  const handleDownloadCsv = () => {
    if (combinedChartData.length === 0) return;

    const keys = Array.from(
      new Set(combinedChartData.flatMap((data) => Object.keys(data))),
    );

    const headerRow = ["time", ...keys.filter((key) => key !== "time")];

    const csvContent = [
      headerRow.join(","),
      ...combinedChartData.map((data) =>
        headerRow
          .map((key) => {
            const value = data[key];
            return value !== undefined && value !== null
              ? value.toString()
              : "";
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `temperature_data_${new Date().toISOString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timeframeLabel = formatTimeframeLabel(timeRange);

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
          <PidControllerCard
            currentTemp={currentTemp}
            targetTemp={targetTemp}
            isActive={isActive}
            pidParameters={pidParameters}
            pidRuntimeState={pidRuntimeState}
            onStatusChange={handleStatusRefresh}
          />

          <PeriodSummaryCard
            avgTemp={avgTemp}
            avgPower={heaterPinData?.avgPower ?? null}
            totalEnergy={heaterPinData?.totalEnergy ?? null}
            timeframeLabel={timeframeLabel}
          />
        </div>
      </aside>

      <div className="dashboard-content">
        <div className="mb-4">
          <DashboardControls
            selectedPin={selectedPin}
            onPinChange={setSelectedPin}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            timeInterval={timeInterval}
            onTimeIntervalChange={setTimeInterval}
            refreshInterval={refreshInterval}
            onRefreshIntervalChange={setRefreshInterval}
            onDownloadCsv={handleDownloadCsv}
          />
        </div>
        <TemperatureChart
          data={combinedChartData}
          timeframeLabel={timeframeLabel}
          spanMs={spanMs}
          interval={timeInterval}
        />
      </div>
    </>
  );
}
