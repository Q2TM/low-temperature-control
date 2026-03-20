import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@repo/ui/molecule/card";

type PeriodSummaryCardProps = {
  avgTemp: number | null;
  avgPower: number | null;
  totalEnergy: number | null;
  timeframeLabel: string;
};

export function PeriodSummaryCard({
  avgTemp,
  avgPower,
  totalEnergy,
  timeframeLabel,
}: PeriodSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="text-lg">Period Summary</CardDescription>
        <p className="text-sm text-muted-foreground">{timeframeLabel}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <div className="text-sm text-muted-foreground">Avg Temperature</div>
            <div className="text-xl font-semibold tabular-nums">
              {avgTemp !== null ? avgTemp.toFixed(2) : "--"} °C
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Avg Power</div>
            <div className="text-xl font-semibold tabular-nums">
              {avgPower !== null ? avgPower.toFixed(2) : "--"} W
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Total Energy</div>
          <div className="text-xl font-semibold tabular-nums">
            {totalEnergy !== null ? `${totalEnergy.toFixed(0)} J` : "-- J"}
          </div>
          <div className="text-sm text-muted-foreground">
            {totalEnergy !== null
              ? `${(totalEnergy / 3600).toFixed(2)} Wh`
              : "-- Wh"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
