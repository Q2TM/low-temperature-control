import {
  getHeaterConfig,
  getHeaterStatus,
  getPIDParameters,
} from "@/actions/heater";
import { DashboardContent } from "@/components/DashboardContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch heater data on the server
  const [heaterConfig, heaterStatus, pidParameters] = await Promise.all([
    getHeaterConfig(),
    getHeaterStatus(),
    getPIDParameters(),
  ]);

  const targetTemp = heaterConfig?.targetTemp ?? null;
  const isActive = heaterStatus?.isActive ?? false;

  return (
    <main className="p-4">
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
        />
      </div>
    </main>
  );
}
