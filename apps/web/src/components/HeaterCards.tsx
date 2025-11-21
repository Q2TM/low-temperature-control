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

export default function HeaterCards({ nMinutes }: { nMinutes: number }) {
  return (
    <>
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
    </>
  );
}
