import { getHeaterStatus, getPIDParameters } from "@/actions/heater";
import { DashboardContent } from "@/components/DashboardContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [heaterStatus, pidParameters] = await Promise.all([
    getHeaterStatus(1),
    getPIDParameters(1),
  ]);

  const targetTemp = heaterStatus?.target ?? null;
  const isActive = heaterStatus?.isActive ?? false;

  const pidRuntimeState = heaterStatus
    ? {
        power: heaterStatus.power,
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
          initialTargetTemp={targetTemp}
          initialIsActive={isActive}
          initialPidParameters={pidParameters}
          initialPidRuntimeState={pidRuntimeState}
        />
      </div>
    </main>
  );
}
