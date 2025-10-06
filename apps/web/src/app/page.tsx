import { sql } from "drizzle-orm";
import { FileWarning, Heater, TrendingDown, TrendingUp } from "lucide-react";

import { sensorMetrics } from "@repo/tsdb";
import { Badge } from "@repo/ui/base/badge";
import { Button } from "@repo/ui/base/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/base/card";

import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { db } from "@/libs/db";

export default async function Home() {
  const data =
    (await db.execute(sql`SELECT time_bucket(interval '10s', time)       AS "time",
       avg(temp_kelvin) FILTER (WHERE channel = 1) AS "Channel 1",
       avg(temp_kelvin) FILTER (WHERE channel = 2) AS "Channel 2",
       avg(temp_kelvin) FILTER (WHERE channel = 3) AS "Channel 3",
       avg(temp_kelvin) FILTER (WHERE channel = 4) AS "Channel 4"
FROM ${sensorMetrics}
WHERE time >= '2025-09-12T11:00:00Z' AND time < '2025-09-12T11:10:00Z' AND instance = 'sensor-1'
GROUP BY 1
ORDER BY 1 ASC;
`)) as Array<{
      time: string;
      "Channel 1": number;
      "Channel 2": number;
      "Channel 3": number;
      "Channel 4": number;
    }>;

  const lastEntry = data[data.length - 1];
  const firstEntry = data[0];
  const lastEntryTempC = lastEntry ? lastEntry["Channel 1"] - 273.15 : null;
  const firstEntryTempC = firstEntry ? firstEntry["Channel 1"] - 273.15 : null;
  const tempChange =
    lastEntryTempC !== null && firstEntryTempC !== null
      ? (((lastEntryTempC - firstEntryTempC) / firstEntryTempC) * 100).toFixed(
          2,
        )
      : null;
  const avgChannel1 =
    data.reduce((sum, entry) => sum + entry["Channel 1"], 0) / data.length;
  const avgChannel1C = avgChannel1 - 273.15;

  return (
    <main className="p-4 flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="self-center my-8">
        <h1 className="text-3xl font-bold">
          Lab 20-05 (20th Floor, Building 4)
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription className="text-lg">
              Current Temperature
            </CardDescription>
            <CardTitle className="text-2xl">
              {lastEntryTempC ? lastEntryTempC.toFixed(2) : "--"} °C
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {Number.isNaN(Number(tempChange)) ? (
                  <FileWarning />
                ) : Number(tempChange) >= 0 ? (
                  <TrendingUp />
                ) : (
                  <TrendingDown />
                )}
                {Number.isNaN(Number(tempChange)) ? "--" : tempChange}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Average Temperature Past 10 Minutes
            </div>
            <div className="text-muted-foreground">
              {avgChannel1C ? avgChannel1C.toFixed(2) : "--"} °C
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="text-lg">
              Current Heat Power
            </CardDescription>
            <CardTitle className="text-2xl">6.5 W</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Heater />
                80%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Total Power Past 10 Minutes
            </div>
            <div className="text-muted-foreground">4200 J (1.17 Wh)</div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="text-lg">
              Target Temperature
            </CardDescription>
            <CardAction>
              <Heater />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">24 °C</div>
          </CardContent>
          <CardFooter>
            <Button>Edit</Button>
          </CardFooter>
        </Card>
      </div>

      <TemperatureChart data={data} />
    </main>
  );
}
