import { Heater } from "lucide-react";

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

type HeaterCardsProps = {
  nMinutes: number;
  heaterStatus: {
    currentPower: number | null;
    dutyCycle: number | null;
    totalEnergy: number | null;
  } | null;
  targetTemp: number | null;
};

export default function HeaterCards({
  nMinutes,
  heaterStatus,
  targetTemp,
}: HeaterCardsProps) {
  const currentPower = heaterStatus?.currentPower ?? null;
  const dutyCycle = heaterStatus?.dutyCycle ?? null;
  const totalEnergy = heaterStatus?.totalEnergy ?? null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardDescription className="text-lg">
            Current Heat Power
          </CardDescription>
          <CardTitle className="text-2xl">
            {currentPower !== null ? currentPower.toFixed(2) : "--"} W
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Heater />
              {dutyCycle !== null ? `${(dutyCycle * 100).toFixed(0)}%` : "--"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total Energy Past {nMinutes} Minutes
          </div>
          <div className="text-muted-foreground">
            {totalEnergy !== null
              ? `${totalEnergy.toFixed(0)} J (${(totalEnergy / 3600).toFixed(2)} Wh)`
              : "-- J (-- Wh)"}
          </div>
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
          <div className="text-2xl font-semibold">
            {targetTemp !== null ? `${targetTemp.toFixed(1)} °C` : "-- °C"}
          </div>
        </CardContent>
        <CardFooter>
          <Button>Edit</Button>
        </CardFooter>
      </Card>
    </>
  );
}
