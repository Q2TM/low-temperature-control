"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/molecule/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/organism/chart";

const TEMP_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];
const HEATER_COLOR = "var(--chart-5)";

/** Sanitize a data key into a valid CSS custom property fragment */
function toConfigKey(key: string) {
  return key.toLowerCase().replace(/ /g, "-");
}

type TemperatureChartProps = {
  data: Array<{
    time: string;
    [key: string]: number | string | Date;
  }>;
  timeframeLabel: string;
  spanMs: number;
  interval: number;
};

export function TemperatureChart({
  data,
  timeframeLabel,
  spanMs,
  interval,
}: TemperatureChartProps) {
  const channelKeys = useMemo(
    () =>
      data.length > 0
        ? Object.keys(data[0]!).filter((key) => key !== "time")
        : [],
    [data],
  );

  const tempChannels = useMemo(
    () => channelKeys.filter((key) => key.startsWith("Thermo Ch ")),
    [channelKeys],
  );
  const heaterChannels = useMemo(
    () => channelKeys.filter((key) => key.startsWith("Heater Ch ")),
    [channelKeys],
  );

  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    tempChannels.forEach((key, i) => {
      config[toConfigKey(key)] = {
        label: key,
        color: TEMP_COLORS[i % TEMP_COLORS.length],
      };
    });
    heaterChannels.forEach((key) => {
      config[toConfigKey(key)] = {
        label: key,
        color: HEATER_COLOR,
      };
    });
    return config;
  }, [tempChannels, heaterChannels]);

  // Calculate Y-axis domain based on temperature data
  const allTemperatures = data.flatMap((item) =>
    tempChannels
      .map((key) => item[key])
      .filter((temp): temp is number => typeof temp === "number"),
  );
  const minTemp = allTemperatures.length > 0 ? Math.min(...allTemperatures) : 0;
  const maxTemp =
    allTemperatures.length > 0 ? Math.max(...allTemperatures) : 100;
  const padding = (maxTemp - minTemp) * 0.1 || 1;
  const yDomain = [minTemp - padding, maxTemp + padding];

  // Insert null-value markers at time gaps so Recharts breaks the line
  const gapThresholdMs = interval * 1000 * 1.5;
  const dataWithGaps: Array<Record<string, string | number | Date | null>> = [];

  for (let i = 0; i < data.length; i++) {
    dataWithGaps.push(data[i]!);

    if (i < data.length - 1) {
      const currentTime = new Date(data[i]!.time as string).getTime();
      const nextTime = new Date(data[i + 1]!.time as string).getTime();

      if (nextTime - currentTime > gapThresholdMs) {
        const gapMarker: Record<string, string | number | Date | null> = {
          time: new Date(currentTime + interval * 1000).toISOString(),
        };
        channelKeys.forEach((key) => {
          gapMarker[key] = null;
        });
        dataWithGaps.push(gapMarker);
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Chart</CardTitle>
        <CardDescription>{timeframeLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={dataWithGaps}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} yAxisId="temp" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                const showDate = spanMs > 24 * 60 * 60 * 1000;
                if (showDate) {
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                }
                return date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: spanMs <= 60 * 60 * 1000 ? "2-digit" : undefined,
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
              tickFormatter={(value) => `${value.toFixed(2)} °C`}
            />
            {heaterChannels.length > 0 && (
              <YAxis
                yAxisId="power"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value.toFixed(1)} W`}
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
            {tempChannels.map((channelKey) => (
              <Line
                key={channelKey}
                yAxisId="temp"
                dataKey={channelKey}
                type="monotone"
                stroke={`var(--color-${toConfigKey(channelKey)})`}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
                unit="°C"
              />
            ))}
            {heaterChannels.map((channelKey) => (
              <Line
                key={channelKey}
                yAxisId="power"
                dataKey={channelKey}
                type="monotone"
                stroke={`var(--color-${toConfigKey(channelKey)})`}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                strokeDasharray="5 5"
                isAnimationActive={false}
                unit="W"
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start text-sm text-muted-foreground">
        {heaterChannels.length > 0 ? (
          <>
            <span>Solid lines: sensor temperature (°C).</span>
            <span>Dashed line: heater power (W), right axis.</span>
          </>
        ) : (
          "Sensor temperature from Lakeshore (°C)."
        )}
      </CardFooter>
    </Card>
  );
}
