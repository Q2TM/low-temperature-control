"use client";

import { Plug, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@repo/ui/atom/badge";
import { Button } from "@repo/ui/atom/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@repo/ui/molecule/card";

import {
  connectLakeshore,
  getLakeshoreIdentification,
  getLakeshoreModuleName,
} from "@/actions/lakeshore";

export type LakeshoreIdentification = {
  manufacturer: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
};

type Props = {
  systemId: string;
  initialIdentification: LakeshoreIdentification | null;
  initialModuleName: string | null;
};

const REFRESH_INTERVAL_MS = 10_000;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm tabular-nums break-all">{value}</span>
    </div>
  );
}

export function LakeshoreDeviceCard({
  systemId,
  initialIdentification,
  initialModuleName,
}: Props) {
  const [identification, setIdentification] = useState(initialIdentification);
  const [moduleName, setModuleName] = useState(initialModuleName);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnecting, startConnect] = useTransition();

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [ident, mod] = await Promise.all([
        getLakeshoreIdentification(systemId),
        getLakeshoreModuleName(systemId),
      ]);
      setIdentification(ident);
      setModuleName(mod);
    } finally {
      setIsRefreshing(false);
    }
  }, [systemId]);

  useEffect(() => {
    const id = setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const handleConnect = () => {
    startConnect(async () => {
      const result = await connectLakeshore(systemId);
      if (result.success) {
        toast.success("Connected to Lakeshore device");
        await refresh();
      } else {
        toast.error(result.error ?? "Failed to connect");
      }
    });
  };

  const isConnected = identification !== null;

  return (
    <Card>
      <CardHeader>
        <CardDescription className="text-lg">Lakeshore Device</CardDescription>
        <CardAction>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConnected && identification ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
            <Field label="Manufacturer" value={identification.manufacturer} />
            <Field label="Model" value={identification.model} />
            <Field label="Serial Number" value={identification.serialNumber} />
            <Field
              label="Firmware Version"
              value={identification.firmwareVersion}
            />
            <Field label="Module Name" value={moduleName ?? "—"} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Device is not reachable. Click Reconnect to retry.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
            disabled={isRefreshing}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {!isConnected && (
            <Button size="sm" onClick={handleConnect} disabled={isConnecting}>
              <Plug className="mr-2 h-4 w-4" />
              {isConnecting ? "Connecting…" : "Reconnect"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
