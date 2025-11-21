import {
  getHeaterConfig,
  getHeaterStatus,
  getPIDParameters,
} from "@/actions/heater";
import { DashboardContent } from "@/components/DashboardContent";

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
    <main className="p-4 flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="self-center my-8">
        <h1 className="text-3xl font-bold">
          Lab 20-05 (20th Floor, Building 4)
        </h1>
      </header>

      <DashboardContent
        initialTargetTemp={targetTemp}
        initialIsActive={isActive}
        initialPidParameters={pidParameters}
      />
    </main>
  );
}
