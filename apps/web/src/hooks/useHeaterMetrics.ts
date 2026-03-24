import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getHeaterMetrics } from "@/actions/riceShower";

type UseHeaterMetricsProps = {
  interval: number;
  timeStart: number;
  timeRange: number;
  pins: number[];
  instanceName?: string;
};

type PinData = {
  currentDutyCycle: number | null;
  firstDutyCycle: number | null;
  dutyCycleChange: number | null;
  avgDutyCycle: number | null;
  currentPower: number | null;
  firstPower: number | null;
  powerChange: number | null;
  avgPower: number | null;
  totalEnergy: number | null; // in Joules
};

type HeaterMetricsResult = {
  pins: Record<number, PinData>;
  chartData: Array<{ time: string; [key: string]: string | number }>;
};

/**
 * Hook to fetch and process heater metrics from the rice-shower API
 * @param interval - Interval in seconds for time bucketing
 * @param timeStart - Start time in milliseconds (timestamp)
 * @param timeRange - Time range in milliseconds
 * @param pins - Array of pin numbers to query
 * @param instanceName - Name of the heater instance (default: "heater-1")
 */
export function useHeaterMetrics({
  interval,
  timeStart,
  timeRange,
  pins,
  instanceName = "heater-1",
}: UseHeaterMetricsProps): HeaterMetricsResult | undefined {
  const timeEnd = timeStart + timeRange;

  const { data: rawData } = useQuery({
    queryKey: [
      "heaterMetrics",
      instanceName,
      pins,
      timeStart,
      timeEnd,
      interval,
    ],
    queryFn: () =>
      getHeaterMetrics({
        instanceName,
        pins,
        timeStart,
        timeEnd,
        interval,
      }),
    placeholderData: (previousData) => previousData,
  });

  return useMemo(() => {
    if (!rawData) {
      return undefined;
    }

    const data = rawData.metrics;

    // Helper function to safely get pin data
    const getPinDutyCycle = (
      entry: (typeof data)[number],
      pinNum: number,
    ): number | null => {
      const pinData = entry.pins.find((p) => p.pinNumber === pinNum);
      return pinData ? pinData.dutyCycle : null;
    };

    const getPinPower = (
      entry: (typeof data)[number],
      pinNum: number,
    ): number | null => {
      const pinData = entry.pins.find((p) => p.pinNumber === pinNum);
      return pinData ? pinData.powerWatts : null;
    };

    // Get first and last entries
    const lastEntry = data.length > 0 ? data[data.length - 1] : null;
    const firstEntry = data.length > 0 ? data[0] : null;

    // Calculate metrics for all pins
    const pinsData: Record<number, PinData> = {};

    pins.forEach((pinNum) => {
      const currentDutyCycle = lastEntry
        ? getPinDutyCycle(lastEntry, pinNum)
        : null;
      const firstDutyCycle = firstEntry
        ? getPinDutyCycle(firstEntry, pinNum)
        : null;

      const dutyCycleChange =
        currentDutyCycle !== null &&
        firstDutyCycle !== null &&
        firstDutyCycle !== 0
          ? ((currentDutyCycle - firstDutyCycle) / Math.abs(firstDutyCycle)) *
            100
          : null;

      const validDutyCycles = data
        .map((entry) => getPinDutyCycle(entry, pinNum))
        .filter((d): d is number => d !== null);
      const avgDutyCycle =
        validDutyCycles.length > 0
          ? validDutyCycles.reduce((sum, d) => sum + d, 0) /
            validDutyCycles.length
          : null;

      const currentPower = lastEntry ? getPinPower(lastEntry, pinNum) : null;
      const firstPower = firstEntry ? getPinPower(firstEntry, pinNum) : null;

      const powerChange =
        currentPower !== null && firstPower !== null && firstPower !== 0
          ? ((currentPower - firstPower) / Math.abs(firstPower)) * 100
          : null;

      const validPowers = data
        .map((entry) => getPinPower(entry, pinNum))
        .filter((p): p is number => p !== null);
      const avgPower =
        validPowers.length > 0
          ? validPowers.reduce((sum, p) => sum + p, 0) / validPowers.length
          : null;

      // Trapezoidal integration of power over time, skipping gaps
      const gapThresholdMs = interval * 1000 * 1.5;
      let totalEnergyJoules = 0;
      let hasEnergyData = false;
      for (let i = 1; i < data.length; i++) {
        const dtMs =
          new Date(data[i]!.time).getTime() -
          new Date(data[i - 1]!.time).getTime();
        if (dtMs > gapThresholdMs) continue;
        const p1 = getPinPower(data[i - 1]!, pinNum);
        const p2 = getPinPower(data[i]!, pinNum);
        if (p1 !== null && p2 !== null) {
          totalEnergyJoules += ((p1 + p2) / 2) * (dtMs / 1000);
          hasEnergyData = true;
        }
      }
      const totalEnergy = hasEnergyData ? totalEnergyJoules : null;

      pinsData[pinNum] = {
        currentDutyCycle,
        firstDutyCycle,
        dutyCycleChange,
        avgDutyCycle,
        currentPower,
        firstPower,
        powerChange,
        avgPower,
        totalEnergy,
      };
    });

    // Transform data for chart consumption
    const chartData = data.map((entry) => {
      const dataPoint: { time: string; [key: string]: string | number } = {
        time: entry.time,
      };

      entry.pins.forEach((pin) => {
        dataPoint[`Pin ${pin.pinNumber} Duty Cycle`] = pin.dutyCycle;
        dataPoint[`Pin ${pin.pinNumber} Power (W)`] = pin.powerWatts;
      });

      return dataPoint;
    });

    return {
      pins: pinsData,
      chartData,
    };
  }, [rawData, pins, interval]);
}
