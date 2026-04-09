"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/molecule/select";

type SystemOption = {
  id: string;
  displayName: string;
};

type SystemSwitcherProps = {
  systems: SystemOption[];
  currentSystemId: string;
};

export function SystemSwitcher({
  systems,
  currentSystemId,
}: SystemSwitcherProps) {
  const router = useRouter();

  const handleChange = (systemId: string) => {
    router.push(`/${systemId}`);
  };

  if (systems.length <= 1) {
    const current = systems.find((s) => s.id === currentSystemId);
    return (
      <span className="text-sm font-medium text-muted-foreground">
        {current?.displayName ?? "No systems"}
      </span>
    );
  }

  return (
    <Select value={currentSystemId} onValueChange={handleChange}>
      <SelectTrigger size="sm" className="w-[180px]">
        <SelectValue placeholder="Select system" />
      </SelectTrigger>
      <SelectContent>
        {systems.map((system) => (
          <SelectItem key={system.id} value={system.id}>
            {system.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
