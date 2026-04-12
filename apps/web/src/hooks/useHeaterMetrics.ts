import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getHeaterMetrics } from "@/actions/riceShower";

type UseHeaterMetricsProps = {
  interval: number;
  timeStart: number;
  timeRange: number;
  channels: number[];
  systemId: string;
};

type ChannelData = {
  currentPower: number | null;
  firstPower: number | null;
  powerChange: number | null;
  avgPower: number | null;
  totalEnergy: number | null; // in Joules
};

type HeaterMetricsResult = {
  channels: Record<number, ChannelData>;
  chartData: Array<{ time: string; [key: string]: string | number }>;
};

/**
 * Hook to fetch and process heater metrics from the rice-shower API
 * @param interval - Interval in seconds for time bucketing
 * @param timeStart - Start time in milliseconds (timestamp)
 * @param timeRange - Time range in milliseconds
 * @param channels - Array of channel numbers to query
 * @param systemId - System ID for the query
 */
export function useHeaterMetrics({
  interval,
  timeStart,
  timeRange,
  channels,
  systemId,
}: UseHeaterMetricsProps): HeaterMetricsResult | undefined {
  const timeEnd = timeStart + timeRange;

  const { data: rawData } = useQuery({
    queryKey: [
      "heaterMetrics",
      systemId,
      channels,
      timeStart,
      timeEnd,
      interval,
    ],
    queryFn: () =>
      getHeaterMetrics({
        systemId,
        channels,
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

    // Helper function to safely get channel power
    const getChannelPower = (
      entry: (typeof data)[number],
      channelNum: number,
    ): number | null => {
      const channelData = entry.channels.find((c) => c.channel === channelNum);
      return channelData ? channelData.powerWatts : null;
    };

    // Get first and last entries
    const lastEntry = data.length > 0 ? data[data.length - 1] : null;
    const firstEntry = data.length > 0 ? data[0] : null;

    // Calculate metrics for all channels
    const channelsData: Record<number, ChannelData> = {};

    channels.forEach((channelNum) => {
      const currentPower = lastEntry
        ? getChannelPower(lastEntry, channelNum)
        : null;
      const firstPower = firstEntry
        ? getChannelPower(firstEntry, channelNum)
        : null;

      const powerChange =
        currentPower !== null && firstPower !== null && firstPower !== 0
          ? ((currentPower - firstPower) / Math.abs(firstPower)) * 100
          : null;

      const validPowers = data
        .map((entry) => getChannelPower(entry, channelNum))
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
        const p1 = getChannelPower(data[i - 1]!, channelNum);
        const p2 = getChannelPower(data[i]!, channelNum);
        if (p1 !== null && p2 !== null) {
          totalEnergyJoules += ((p1 + p2) / 2) * (dtMs / 1000);
          hasEnergyData = true;
        }
      }
      const totalEnergy = hasEnergyData ? totalEnergyJoules : null;

      channelsData[channelNum] = {
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

      entry.channels.forEach((ch) => {
        dataPoint[`Heater Ch ${ch.channel}`] = ch.powerWatts;
      });

      return dataPoint;
    });

    return {
      channels: channelsData,
      chartData,
    };
  }, [rawData, channels, interval]);
}
