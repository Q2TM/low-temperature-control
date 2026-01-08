import { useMemo } from "react";

import { riceShower } from "@/libs/api";

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

  const { data: rawData } = riceShower.useQuery(
    "get",
    "/query/heater/{instance_name}",
    {
      params: {
        path: {
          instance_name: instanceName,
        },
        query: {
          pins,
          time_start: timeStart,
          time_end: timeEnd,
          interval,
        },
      },
    },
    {
      placeholderData: (previousData) => previousData,
    },
  );

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

      const avgDutyCycle =
        data.length > 0
          ? data.reduce((sum, entry) => {
              const dutyCycle = getPinDutyCycle(entry, pinNum);
              return sum + (dutyCycle ?? 0);
            }, 0) / data.length
          : null;

      const currentPower = lastEntry ? getPinPower(lastEntry, pinNum) : null;
      const firstPower = firstEntry ? getPinPower(firstEntry, pinNum) : null;

      const powerChange =
        currentPower !== null && firstPower !== null && firstPower !== 0
          ? ((currentPower - firstPower) / Math.abs(firstPower)) * 100
          : null;

      const avgPower =
        data.length > 0
          ? data.reduce((sum, entry) => {
              const power = getPinPower(entry, pinNum);
              return sum + (power ?? 0);
            }, 0) / data.length
          : null;

      // Calculate total energy (integral of power over time)
      // Energy = average power * time duration (in seconds)
      const totalEnergy =
        avgPower !== null ? avgPower * (timeRange / 1000) : null;

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
  }, [rawData, timeRange, pins]);
}
