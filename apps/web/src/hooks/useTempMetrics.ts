import { useMemo } from "react";

import { riceShower } from "@/libs/api";

type UseTempMetricsProps = {
  interval: number;
  timeStart: number;
  timeRange: number;
  channels: number[];
  instanceName?: string;
};

type ChannelData = {
  currentTemp: number | null;
  firstTemp: number | null;
  tempChange: number | null;
  avgTemp: number | null;
};

type TempMetricsResult = {
  isLoading: boolean;
  error: {
    error: string;
  } | null;
  channels: Record<number, ChannelData>;
  chartData: Array<{ time: string; [key: string]: string | number }>;
};

/**
 * Hook to fetch and process temperature metrics from the rice-shower API
 * @param interval - Interval in seconds for time bucketing
 * @param timeStart - Start time in milliseconds (timestamp)
 * @param timeRange - Time range in milliseconds
 * @param channels - Array of channel numbers to query
 * @param instanceName - Name of the sensor instance (default: "sensor-1")
 */
export function useTempMetrics({
  interval,
  timeStart,
  timeRange,
  channels,
  instanceName = "sensor-1",
}: UseTempMetricsProps): TempMetricsResult | undefined {
  const timeEnd = timeStart + timeRange;

  const {
    data: rawData,
    isLoading,
    error,
  } = riceShower.useQuery(
    "get",
    "/query/temp/{instance_name}",
    {
      params: {
        path: {
          instance_name: instanceName,
        },
        query: {
          channels,
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

    // Helper function to convert Kelvin to Celsius
    const kelvinToCelsius = (kelvin: number): number => kelvin - 273.15;

    // Helper function to safely get temperature for a channel
    const getChannelTemp = (
      entry: (typeof data)[number],
      channelNum: number,
    ): number | null => {
      const channelData = entry.channels.find((c) => c.channel === channelNum);
      return channelData ? kelvinToCelsius(channelData.kelvin) : null;
    };

    // Get first and last entries
    const lastEntry = data.length > 0 ? data[data.length - 1] : null;
    const firstEntry = data.length > 0 ? data[0] : null;

    // Calculate metrics for all channels
    const channelsData: Record<number, ChannelData> = {};

    channels.forEach((channelNum) => {
      const currentTemp = lastEntry
        ? getChannelTemp(lastEntry, channelNum)
        : null;
      const firstTemp = firstEntry
        ? getChannelTemp(firstEntry, channelNum)
        : null;

      const tempChange =
        currentTemp !== null && firstTemp !== null && firstTemp !== 0
          ? ((currentTemp - firstTemp) / Math.abs(firstTemp)) * 100
          : null;

      const avgTemp =
        data.length > 0
          ? data.reduce((sum, entry) => {
              const temp = getChannelTemp(entry, channelNum);
              return sum + (temp ?? 0);
            }, 0) / data.length
          : null;

      channelsData[channelNum] = {
        currentTemp,
        firstTemp,
        tempChange,
        avgTemp,
      };
    });

    // Transform data for chart consumption
    const chartData = data.map((entry) => {
      const dataPoint: { time: string; [key: string]: string | number } = {
        time: entry.time,
      };

      entry.channels.forEach((channel) => {
        dataPoint[`Channel ${channel.channel}`] = channel.kelvin;
      });

      return dataPoint;
    });

    return {
      isLoading,
      error,
      channels: channelsData,
      chartData,
    };
  }, [rawData, isLoading, error, channels]);
}
