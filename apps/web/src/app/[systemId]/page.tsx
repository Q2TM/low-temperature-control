import { notFound } from "next/navigation";

import { getActiveExperiment } from "@/actions/experiments";
import { getHeaterStatus, getPIDParameters } from "@/actions/heater";
import { getLakeshoreTemperatureCelsius } from "@/actions/lakeshore";
import { DashboardContent } from "@/components/DashboardContent";
import { resolveSystem } from "@/libs/systemRegistry";
import type { TimeRange } from "@/libs/timeConfig";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ systemId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseInitialTimeRange(
  search: Record<string, string | string[] | undefined>,
): TimeRange | null {
  const start = search.expStart;
  const end = search.expEnd;
  if (typeof start !== "string" || typeof end !== "string") return null;
  const s = Date.parse(start);
  const e = Date.parse(end);
  if (Number.isNaN(s) || Number.isNaN(e) || s >= e) return null;
  return { mode: "absolute", start: s, end: e };
}

export default async function SystemDashboardPage({
  params,
  searchParams,
}: Props) {
  const { systemId } = await params;
  const search = await searchParams;
  const initialTimeRange = parseInitialTimeRange(search);
  const system = await resolveSystem(systemId);

  if (!system) {
    notFound();
  }

  const sensorChannel = system.thermos[0]?.channel ?? 1;
  const heaterChannel = system.heaters[0]?.channel ?? 1;

  const [heaterStatus, pidParameters, lakeshoreTemp, activeExperiment] =
    await Promise.all([
      getHeaterStatus(heaterChannel, systemId),
      getPIDParameters(heaterChannel, systemId),
      getLakeshoreTemperatureCelsius(sensorChannel, systemId),
      getActiveExperiment(systemId, heaterChannel),
    ]);

  const targetTemp = heaterStatus?.pid.target ?? null;
  const isActive = heaterStatus?.pid.isActive ?? false;
  const currentTemp = lakeshoreTemp ?? heaterStatus?.currentTemp ?? null;

  const pidRuntimeState = heaterStatus
    ? {
        power: heaterStatus.heater.power,
        powerWatts: heaterStatus.heater.powerWatts,
        startedAt: heaterStatus.pid.startedAt,
        runningForSeconds: heaterStatus.pid.runningForSeconds,
        pidVariables: heaterStatus.pid.variables,
        errorStats: heaterStatus.pid.errorStats,
        lastStopReason: heaterStatus.pid.lastStopReason ?? null,
        lastStopAt: heaterStatus.pid.lastStopAt ?? null,
        lastStopDetail: heaterStatus.pid.lastStopDetail ?? null,
      }
    : null;

  return (
    <main className="p-4 max-w-7xl mx-auto">
      <header className="text-center my-8 lg:hidden">
        <h1 className="text-3xl font-bold">{system.displayName}</h1>
        {system.location && (
          <p className="text-sm text-muted-foreground">{system.location}</p>
        )}
      </header>

      <div className="dashboard-layout">
        <DashboardContent
          systemId={systemId}
          systemDisplayName={system.displayName}
          systemLocation={system.location}
          sensorChannel={sensorChannel}
          heaterChannel={heaterChannel}
          initialCurrentTemp={currentTemp}
          initialTargetTemp={targetTemp}
          initialIsActive={isActive}
          initialPidParameters={pidParameters}
          initialPidRuntimeState={pidRuntimeState}
          initialActiveExperiment={activeExperiment}
          initialTimeRange={initialTimeRange}
        />
      </div>
    </main>
  );
}
