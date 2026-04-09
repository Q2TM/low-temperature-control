import { getSystems } from "@/actions/systems";
import { NavBar } from "@/components/layout/NavBar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ systemId: string }>;
};

export default async function SystemLayout({ children, params }: Props) {
  const { systemId } = await params;
  const systems = await getSystems();

  return (
    <>
      <NavBar
        systems={systems.map((s) => ({ id: s.id, displayName: s.displayName }))}
        currentSystemId={systemId}
      />
      {children}
    </>
  );
}
