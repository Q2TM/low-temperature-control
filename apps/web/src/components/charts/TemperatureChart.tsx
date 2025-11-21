"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/base/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/base/chart";

export const description = "A line chart";

const chartConfig = {
  channel1: {
    label: "Channel 1",
    color: "var(--chart-1)",
  },
  channel2: {
    label: "Channel 2",
    color: "var(--chart-2)",
  },
  channel3: {
    label: "Channel 3",
    color: "var(--chart-3)",
  },
  channel4: {
    label: "Channel 4",
    color: "var(--chart-4)",
  },
  heater: {
    label: "Heater Power",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

type TemperatureChartProps = {
  data: Array<{
    time: string;
    [key: string]: number | string | Date;
  }>;
  nMinutes: number;
};

export function TemperatureChart({ data, nMinutes }: TemperatureChartProps) {
  // Get all channel keys (exclude 'time')
  const channelKeys =
    data.length > 0
      ? Object.keys(data[0]!).filter((key) => key !== "time")
      : [];

  const mappedData = data.map((item) => {
    const converted: Record<string, string | number | Date> = {
      time: item.time,
    };
    channelKeys.forEach((key) => {
      const value = item[key];
      // Convert Kelvin to Celsius for temperature channels only
      if (typeof value === "number" && key.startsWith("Channel ")) {
        converted[key] = value - 273.15;
      } else if (value !== undefined) {
        converted[key] = value;
      }
    });
    return converted;
  });

  // Separate temperature channels and heater power channels
  const tempChannels = channelKeys.filter((key) => key.startsWith("Channel "));
  const heaterChannels = channelKeys.filter((key) => key.includes("Power (W)"));

  // Calculate Y-axis domain based on temperature data
  const allTemperatures = mappedData.flatMap((item) =>
    tempChannels
      .map((key) => item[key])
      .filter((temp): temp is number => typeof temp === "number"),
  );
  const minTemp = allTemperatures.length > 0 ? Math.min(...allTemperatures) : 0;
  const maxTemp =
    allTemperatures.length > 0 ? Math.max(...allTemperatures) : 100;
  const padding = (maxTemp - minTemp) * 0.1 || 1; // 10% padding or 1 degree minimum
  const yDomain = [minTemp - padding, maxTemp + padding];

  // Calculate interval for X-axis to show ~10 ticks max
  // const tickInterval = Math.ceil(mappedData.length / 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Chart</CardTitle>
        <CardDescription>Past {nMinutes} Minutes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={mappedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                // Format time to show HH:MM:SS
                const date = new Date(value);
                return date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                });
              }}
            />
            <YAxis
              yAxisId="temp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={yDomain}
              tickFormatter={(value) => `${value.toFixed(1)}°C`}
            />
            {heaterChannels.length > 0 && (
              <YAxis
                yAxisId="power"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value.toFixed(0)}W`}
              />
            )}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value, value2) => {
                    // Format the time label in tooltip
                    const date = new Date(
                      (value || value2?.[0]?.payload?.time) as string,
                    );
                    return date.toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    });
                  }}
                />
              }
            />
            {tempChannels.map((channelKey) => {
              const channelIndex = channelKeys.indexOf(channelKey);
              return (
                <Line
                  key={channelKey}
                  yAxisId="temp"
                  dataKey={channelKey}
                  type="natural"
                  stroke={`var(--chart-${(channelIndex % 5) + 1})`}
                  strokeWidth={2}
                  dot={false}
                  unit="°C"
                />
              );
            })}
            {heaterChannels.map((channelKey) => {
              return (
                <Line
                  key={channelKey}
                  yAxisId="power"
                  dataKey={channelKey}
                  type="natural"
                  stroke="var(--chart-5)"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  unit="W"
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        ling gan gu footer
      </CardFooter>
    </Card>
  );
}
