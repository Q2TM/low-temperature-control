import { getHeaterStatus, getPIDParameters } from "@/actions/heater";
import { getLakeshoreTemperatureCelsius } from "@/actions/lakeshore";
import { DashboardContent } from "@/components/DashboardContent";

export const dynamic = "force-dynamic";

/** Lakeshore sensor channel for heater channel 1 (see heater-api config). */
const LAKESHORE_SENSOR_CHANNEL = 1;

export default async function Home() {
  const [heaterStatus, pidParameters, lakeshoreTemp] = await Promise.all([
    getHeaterStatus(1),
    getPIDParameters(1),
    getLakeshoreTemperatureCelsius(LAKESHORE_SENSOR_CHANNEL),
  ]);

  const targetTemp = heaterStatus?.target ?? null;
  const isActive = heaterStatus?.isActive ?? false;
  const currentTemp = lakeshoreTemp ?? heaterStatus?.currentTemp ?? null;

  const pidRuntimeState = heaterStatus
    ? {
        power: heaterStatus.power,
        maxHeaterPowerWatts: heaterStatus.maxHeaterPowerWatts,
        pidVariables: heaterStatus.pidVariables,
        errorStats: heaterStatus.errorStats,
      }
    : null;

  return (
    <main className="p-4 max-w-7xl mx-auto">
      <header className="text-center my-8 lg:hidden">
        <h1 className="text-3xl font-bold">
          Lab 20-05 (20th Floor, Building 4)
        </h1>
      </header>

      <div className="dashboard-layout">
        <DashboardContent
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
