import { notFound } from "next/navigation";

import { CurveEditor } from "@/components/CurveEditor";
import { resolveSystem } from "@/libs/systemRegistry";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ systemId: string }>;
};

export default async function CurvePage({ params }: Props) {
  const { systemId } = await params;
  const system = await resolveSystem(systemId);

  if (!system) {
    notFound();
  }

  return (
    <main className="container mx-auto p-6 max-w-[1800px]">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">Curve Editor</h1>
        <p className="text-muted-foreground mt-2">
          Edit temperature sensor curves for Lakeshore channels
        </p>
      </header>

      <CurveEditor systemId={system.id} />
    </main>
  );
}
