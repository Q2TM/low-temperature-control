import { getHeaterConfig } from "@/actions/heater";
import { DashboardContent } from "@/components/DashboardContent";

export default async function Home() {
  // Fetch heater config on the server
  const heaterConfig = await getHeaterConfig();
  const targetTemp = heaterConfig?.targetTemp ?? null;

  return (
    <main className="p-4 flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="self-center my-8">
        <h1 className="text-3xl font-bold">
          Lab 20-05 (20th Floor, Building 4)
        </h1>
      </header>

      <DashboardContent initialTargetTemp={targetTemp} />
    </main>
  );
}
