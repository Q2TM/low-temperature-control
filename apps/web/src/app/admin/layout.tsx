import { getSystems } from "@/actions/systems";
import { NavBar } from "@/components/layout/NavBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const systems = await getSystems();

  return (
    <>
      <NavBar
        systems={systems.map((s) => ({ id: s.id, displayName: s.displayName }))}
      />
      {children}
    </>
  );
}
