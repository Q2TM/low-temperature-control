"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/molecule/card";

export interface CurveDataPoint {
  index: number;
  temperature: number;
  sensor: number;
}

interface CurveChartProps {
  dataPoints: CurveDataPoint[];
  curveName?: string;
}

export function CurveChart({ dataPoints, curveName }: CurveChartProps) {
  // Sort data points by sensor value for proper line rendering
  const sortedData = [...dataPoints].sort((a, b) => a.sensor - b.sensor);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          {curveName || "Curve"} - Temperature vs Resistance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dataPoints.length === 0 ? (
          <div className="flex items-center justify-center h-[500px] text-muted-foreground">
            No data points to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart
              data={sortedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="sensor"
                label={{
                  value: "Resistance (Ω)",
                  position: "insideBottom",
                  offset: -5,
                }}
                type="number"
                domain={["auto", "auto"]}
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis
                dataKey="temperature"
                label={{
                  value: "Temperature (K)",
                  angle: -90,
                  position: "insideLeft",
                }}
                type="number"
                domain={["auto", "auto"]}
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "temperature") {
                    return [`${value.toFixed(3)} K`, "Temperature"];
                  }
                  return [`${value.toFixed(3)} Ω`, "Resistance"];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--primary))",
                }}
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                }}
                name="Temperature (K)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
