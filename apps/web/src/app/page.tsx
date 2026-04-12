import Link from "next/link";
import { redirect } from "next/navigation";

import { getDefaultSystemId } from "@/libs/systemRegistry";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const systemId = await getDefaultSystemId();

  if (!systemId) {
    return (
      <main className="p-4 max-w-7xl mx-auto">
        <div className="text-center my-16">
          <h1 className="text-2xl font-bold mb-4">No Systems Configured</h1>
          <p className="text-muted-foreground">
            Add a system via the{" "}
            <Link href="/admin/systems" className="underline">
              Systems admin page
            </Link>{" "}
            to get started.
          </p>
        </div>
      </main>
    );
  }

  redirect(`/${systemId}`);
}
