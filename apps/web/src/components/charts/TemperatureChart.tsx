"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardAction,
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
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/base/toggle-group";

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
} satisfies ChartConfig;

type TemperatureChartProps = {
  data: Array<{
    time: string;
    [key: string]: number | string;
  }>;
};

export function TemperatureChart({ data }: TemperatureChartProps) {
  // State for selected channels (default: only Channel 1)
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "Channel 1",
  ]);

  // Get all channel keys (exclude 'time')
  const channelKeys =
    data.length > 0
      ? Object.keys(data[0]!).filter((key) => key !== "time")
      : [];

  const mappedData = data.map((item) => {
    const converted: Record<string, string | number> = { time: item.time };
    channelKeys.forEach((key) => {
      const value = item[key];
      // Convert Kelvin to Celsius if it's a number
      if (typeof value === "number") {
        converted[key] = value - 273.15;
      } else if (value !== undefined) {
        converted[key] = value;
      }
    });
    return converted;
  });

  // Filter channels based on selection
  const visibleChannels = channelKeys.filter((key) =>
    selectedChannels.includes(key),
  );

  // Calculate Y-axis domain based on visible temperature data only
  const allTemperatures = mappedData.flatMap((item) =>
    visibleChannels
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
        <CardDescription>Past 10 Minutes</CardDescription>
        <CardAction>
          <ToggleGroup
            type="multiple"
            value={selectedChannels}
            onValueChange={(value) => {
              // Ensure at least one channel is selected
              if (value.length > 0) {
                setSelectedChannels(value);
              }
            }}
            variant="outline"
            size="sm"
          >
            {channelKeys.map((channelKey) => {
              // Extract channel number from "Channel X" format
              const channelNum = channelKey.replace("Channel ", "");
              return (
                <ToggleGroupItem
                  key={channelKey}
                  value={channelKey}
                  className="py-1 px-4"
                >
                  {channelNum}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </CardAction>
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
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={yDomain}
              tickFormatter={(value) => `${value.toFixed(1)}°C`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) => {
                    // Format the time label in tooltip
                    const date = new Date(value as string);
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
                  unit="°C"
                />
              }
            />
            {visibleChannels.map((channelKey) => {
              const channelIndex = channelKeys.indexOf(channelKey);
              return (
                <Line
                  key={channelKey}
                  dataKey={channelKey}
                  type="natural"
                  stroke={`var(--chart-${(channelIndex % 5) + 1})`}
                  strokeWidth={2}
                  dot={false}
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
