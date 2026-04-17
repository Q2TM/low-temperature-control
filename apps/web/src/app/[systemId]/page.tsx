import { notFound } from "next/navigation";

import { getHeaterStatus, getPIDParameters } from "@/actions/heater";
import { getLakeshoreTemperatureCelsius } from "@/actions/lakeshore";
import { DashboardContent } from "@/components/DashboardContent";
import { resolveSystem } from "@/libs/systemRegistry";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ systemId: string }>;
};

export default async function SystemDashboardPage({ params }: Props) {
  const { systemId } = await params;
  const system = await resolveSystem(systemId);

  if (!system) {
    notFound();
  }

  const sensorChannel = system.thermos[0]?.channel ?? 1;
  const heaterChannel = system.heaters[0]?.channel ?? 1;

  const [heaterStatus, pidParameters, lakeshoreTemp] = await Promise.all([
    getHeaterStatus(heaterChannel, systemId),
    getPIDParameters(heaterChannel, systemId),
    getLakeshoreTemperatureCelsius(sensorChannel, systemId),
  ]);

  const targetTemp = heaterStatus?.pid.target ?? null;
  const isActive = heaterStatus?.pid.isActive ?? false;
  const currentTemp = lakeshoreTemp ?? heaterStatus?.currentTemp ?? null;

  const pidRuntimeState = heaterStatus
    ? {
        power: heaterStatus.heater.power,
        startedAt: heaterStatus.pid.startedAt,
        runningForSeconds: heaterStatus.pid.runningForSeconds,
        pidVariables: heaterStatus.pid.variables,
        errorStats: heaterStatus.pid.errorStats,
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
        />
      </div>
    </main>
  );
}
