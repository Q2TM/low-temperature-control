import { DashboardContent } from "@/components/DashboardContent";
import HeaterCards from "@/components/HeaterCards";

export default function Home() {
  const nMinutes = 10;

  return (
    <main className="p-4 flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="self-center my-8">
        <h1 className="text-3xl font-bold">
          Lab 20-05 (20th Floor, Building 4)
        </h1>
      </header>

      <DashboardContent
        nMinutes={nMinutes}
        heaterCards={<HeaterCards nMinutes={nMinutes} />}
      />
    </main>
  );
}
