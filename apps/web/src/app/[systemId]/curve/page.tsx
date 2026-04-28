import { notFound } from "next/navigation";

import {
  getLakeshoreIdentification,
  getLakeshoreModuleName,
} from "@/actions/lakeshore";
import { CurveEditor } from "@/components/CurveEditor";
import { LakeshoreDeviceCard } from "@/components/LakeshoreDeviceCard";
import { resolveSystem } from "@/libs/systemRegistry";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ systemId: string }>;
};

export default async function LakeShoreManagementPage({ params }: Props) {
  const { systemId } = await params;
  const system = await resolveSystem(systemId);

  if (!system) {
    notFound();
  }

  const [identification, moduleName] = await Promise.all([
    getLakeshoreIdentification(system.id),
    getLakeshoreModuleName(system.id),
  ]);

  return (
    <main className="container mx-auto p-6 max-w-[1800px]">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">Lake Shore Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage the connected Lakeshore device and edit temperature sensor
          curves
        </p>
      </header>

      <div className="mb-6">
        <LakeshoreDeviceCard
          systemId={system.id}
          initialIdentification={identification}
          initialModuleName={moduleName}
        />
      </div>

      <CurveEditor systemId={system.id} />
    </main>
  );
}
