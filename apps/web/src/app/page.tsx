/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { FileWarning, Heater, TrendingDown, TrendingUp } from "lucide-react";

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
import { queryApi } from "@/libs/api";

import AutoRefresh from "./AutoRefresh";

export default async function Home() {
  // temp for demo: pick
  // const timeStart = "2025-09-12T11:00:00Z";
  // const timeEnd = "2025-09-12T11:10:00Z";

  const nMinutes = 30;
  const timeStart = new Date(Date.now() - nMinutes * 60 * 1000).toISOString();
  const timeEnd = new Date().toISOString();

  const data = (
    await queryApi.getMetrics("sensor-1", [1, 2, 3, 4], timeStart, timeEnd, 10)
  ).metrics;

  const lastEntry = data[data.length - 1];
  const firstEntry = data[0];

  const lastEntryTempC = lastEntry
    ? lastEntry.channels.find((entry) => entry.channel === 1)?.kelvin! - 273.15
    : null;
  const firstEntryTempC = firstEntry
    ? firstEntry.channels.find((entry) => entry.channel === 1)?.kelvin! - 273.15
    : null;
  const tempChange =
    lastEntryTempC !== null && firstEntryTempC !== null
      ? (((lastEntryTempC - firstEntryTempC) / firstEntryTempC) * 100).toFixed(
          2,
        )
      : null;
  const avgChannel1 =
    data.reduce(
      (sum, entry) =>
        sum + entry.channels.find((e) => e.channel === 1)?.kelvin! - 273.15,
      0,
    ) / data.length;
  const avgChannel1C = avgChannel1;

  const legacyData = data.map((entry) => {
    const o = { time: entry.time };

    for (const channel of entry.channels) {
      // @ts-expect-error temp speedrun
      o[`Channel ${channel.channel}`] = channel.kelvin;
    }

    return o;
  });

  return (
    <main className="p-4 flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="self-center my-8">
        <h1 className="text-3xl font-bold">
          Lab 20-05 (20th Floor, Building 4)
        </h1>
        <AutoRefresh intervalMs={10000} />
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
              Average Temperature Past {nMinutes} Minutes
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
              Total Power Past {nMinutes} Minutes
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

      <TemperatureChart data={legacyData} nMinutes={nMinutes} />
    </main>
  );
}
