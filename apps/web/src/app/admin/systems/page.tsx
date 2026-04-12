import { getSystems } from "@/actions/systems";
import { SystemsAdmin } from "@/components/admin/SystemsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSystemsPage() {
  const systems = await getSystems();

  return (
    <main className="container mx-auto py-8 px-4">
      <SystemsAdmin initialSystems={systems} />
    </main>
  );
}
