import { CurveEditor } from "@/components/CurveEditor";

export const dynamic = "force-dynamic";

export default async function CurvePage() {
  return (
    <main className="container mx-auto p-6 max-w-[1800px]">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">Curve Editor</h1>
        <p className="text-muted-foreground mt-2">
          Edit temperature sensor curves for Lakeshore channels
        </p>
      </header>

      <CurveEditor />
    </main>
  );
}
