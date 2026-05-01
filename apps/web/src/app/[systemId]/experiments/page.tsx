import { notFound } from "next/navigation";

import { ExperimentsList } from "@/components/ExperimentsList";
import { resolveSystem } from "@/libs/systemRegistry";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ systemId: string }>;
};

export default async function ExperimentsPage({ params }: Props) {
  const { systemId } = await params;
  const system = await resolveSystem(systemId);

  if (!system) {
    notFound();
  }

  return (
    <main className="container mx-auto p-6 max-w-[1400px]">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{system.displayName}</h1>
        <p className="text-sm text-muted-foreground">Past PID experiments</p>
      </header>

      <ExperimentsList systemId={system.id} />
    </main>
  );
}
