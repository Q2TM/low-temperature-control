"use client";

import {
  Check,
  ChevronRight,
  FlaskConical,
  Pause,
  Play,
  X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@repo/ui/atom/badge";
import { Button } from "@repo/ui/atom/button";
import { Input } from "@repo/ui/atom/input";
import { Label } from "@repo/ui/atom/label";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@repo/ui/molecule/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/molecule/dialog";

import {
  type Experiment,
  startExperiment,
  stopExperiment,
} from "@/actions/experiments";
import {
  setPIDParameters,
  setTargetTemperature,
  startPID,
  stopPID,
} from "@/actions/heater";

function formatPidRunningDuration(totalSeconds: number): string {
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

function PowerReadout({
  powerNorm,
  powerWatts,
}: {
  powerNorm: number;
  powerWatts: number;
}) {
  const [showWatts, setShowWatts] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setShowWatts((v) => !v);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  const pct = powerNorm * 100;

  return (
    <div
      className="relative mb-0.5 flex h-4 min-w-[4.25rem] items-center justify-center"
      title={`${pct.toFixed(1)}% · ${powerWatts.toFixed(1)} W`}
    >
      <span className="sr-only">
        {pct.toFixed(1)} percent, {powerWatts.toFixed(1)} watts
      </span>
      <span
        className={`absolute text-xs font-semibold tabular-nums text-orange-500 transition-opacity duration-700 ease-in-out dark:text-orange-400 ${
          showWatts ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={showWatts}
      >
        {pct.toFixed(1)}%
      </span>
      <span
        className={`absolute text-xs font-semibold tabular-nums text-orange-500 transition-opacity duration-700 ease-in-out dark:text-orange-400 ${
          showWatts ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!showWatts}
      >
        {powerWatts.toFixed(1)} W
      </span>
    </div>
  );
}

export type PidStopReason = "overheat" | "sensor_timeout";

export type PidRuntimeState = {
  power: number;
  powerWatts: number;
  startedAt?: string | null;
  runningForSeconds?: number | null;
  pidVariables: {
    integral: number;
    lastError: number;
    lastMeasurement: number | null;
  };
  errorStats: {
    errorsLast1M: number;
    errorsLast10M: number;
    errorsSinceStart: number;
    lastErrorMessage: string | null;
  };
  lastStopReason: PidStopReason | null;
  lastStopAt: string | null;
  lastStopDetail: string | null;
};

type PidControllerCardProps = {
  channelId: number;
  systemId: string;
  currentTemp: number | null;
  targetTemp: number | null;
  isActive: boolean;
  pidParameters: { kp: number; ki: number; kd: number } | null;
  pidRuntimeState: PidRuntimeState | null;
  activeExperiment: Experiment | null;
  onStatusChange?: () => void;
};

export function PidControllerCard({
  channelId,
  systemId,
  currentTemp,
  targetTemp,
  isActive,
  pidParameters,
  pidRuntimeState,
  activeExperiment,
  onStatusChange,
}: PidControllerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPID, setIsEditingPID] = useState(false);
  const [newTargetTemp, setNewTargetTemp] = useState(
    targetTemp?.toString() ?? "",
  );
  const [newKp, setNewKp] = useState(pidParameters?.kp.toString() ?? "");
  const [newKi, setNewKi] = useState(pidParameters?.ki.toString() ?? "");
  const [newKd, setNewKd] = useState(pidParameters?.kd.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);

  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [experimentName, setExperimentName] = useState("");

  // Lock target/PID edits whenever an experiment is active AND the PID is
  // running. Once PID stops (manually or via auto-stop), the row reconciles
  // shortly after, so the lock window closes naturally.
  const isExperimentLocked = activeExperiment !== null && isActive;
  const lockedTooltip = activeExperiment
    ? `Locked during experiment "${activeExperiment.name}"`
    : undefined;

  const handleSetTargetTemp = async () => {
    const temp = parseFloat(newTargetTemp);
    if (isNaN(temp) || temp < 0 || temp > 500) {
      alert("Please enter a valid temperature (0-500°C)");
      return;
    }

    startTransition(async () => {
      const result = await setTargetTemperature(channelId, temp, systemId);
      if (result.success) {
        setIsEditing(false);
        onStatusChange?.();
      } else {
        alert(result.error || "Failed to set target temperature");
      }
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewTargetTemp(targetTemp?.toString() ?? "");
  };

  const handleEditPID = () => {
    setNewKp(pidParameters?.kp.toString() ?? "");
    setNewKi(pidParameters?.ki.toString() ?? "");
    setNewKd(pidParameters?.kd.toString() ?? "");
    setIsEditingPID(true);
  };

  const handleSetPIDParams = async () => {
    const kp = parseFloat(newKp);
    const ki = parseFloat(newKi);
    const kd = parseFloat(newKd);

    if (isNaN(kp) || isNaN(ki) || isNaN(kd)) {
      alert("Please enter valid numbers for all PID parameters");
      return;
    }

    if (kp < 0 || ki < 0 || kd < 0) {
      alert("PID parameters must be non-negative");
      return;
    }

    startTransition(async () => {
      const result = await setPIDParameters(
        channelId,
        { kp, ki, kd },
        systemId,
      );
      if (result.success) {
        setIsEditingPID(false);
        onStatusChange?.();
      } else {
        alert(result.error || "Failed to set PID parameters");
      }
    });
  };

  const handleCancelPIDEdit = () => {
    setIsEditingPID(false);
    setNewKp(pidParameters?.kp.toString() ?? "");
    setNewKi(pidParameters?.ki.toString() ?? "");
    setNewKd(pidParameters?.kd.toString() ?? "");
  };

  const handleTogglePID = async () => {
    startTransition(async () => {
      const result = isActive
        ? await stopPID(channelId, systemId)
        : await startPID(channelId, systemId);
      if (result.success) {
        onStatusChange?.();
      } else {
        alert(result.error || "Failed to toggle PID controller");
      }
    });
  };

  const handleStartExperiment = () => {
    const name = experimentName.trim();
    if (!name) {
      toast.error("Experiment name is required");
      return;
    }
    startTransition(async () => {
      const result = await startExperiment({
        name,
        systemId,
        channel: channelId,
      });
      if (result.success) {
        setStartDialogOpen(false);
        setExperimentName("");
        onStatusChange?.();
      } else {
        toast.error(result.error || "Failed to start experiment");
      }
    });
  };

  const handleStopExperiment = () => {
    if (!activeExperiment) return;
    startTransition(async () => {
      const result = await stopExperiment(activeExperiment.id);
      if (result.success) {
        onStatusChange?.();
      } else {
        toast.error(result.error || "Failed to stop experiment");
      }
    });
  };

  const hasLongErrorMessage =
    (pidRuntimeState?.errorStats.lastErrorMessage?.length ?? 0) > 120;

  return (
    <Card>
      <CardHeader>
        <CardDescription className="text-lg">PID Controller</CardDescription>
        <CardAction>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Running" : "Stopped"}
          </Badge>
        </CardAction>
      </CardHeader>

      {activeExperiment && (
        <div className="px-6 -mt-2">
          <div className="flex items-start gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm">
            <FlaskConical className="size-4 mt-0.5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">
                {activeExperiment.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Experiment running &middot; started{" "}
                {new Date(activeExperiment.startedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      <CardContent className="space-y-4">
        {/* Temperature → Target with animated arrow */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-center min-w-0">
            <div className="text-2xl font-bold tabular-nums">
              {currentTemp !== null ? currentTemp.toFixed(2) : "--"}
            </div>
            <div className="text-xs text-muted-foreground">°C current</div>
          </div>

          <div className="flex flex-col items-center shrink-0">
            {isActive && pidRuntimeState && (
              <PowerReadout
                powerNorm={pidRuntimeState.power}
                powerWatts={pidRuntimeState.powerWatts}
              />
            )}
            <div className="flex items-center -space-x-1.5">
              <ChevronRight
                className={`h-5 w-5 transition-colors ${isActive ? "animate-flow-1 text-primary" : "text-muted-foreground/40"}`}
              />
              <ChevronRight
                className={`h-5 w-5 transition-colors ${isActive ? "animate-flow-2 text-primary" : "text-muted-foreground/40"}`}
              />
              <ChevronRight
                className={`h-5 w-5 transition-colors ${isActive ? "animate-flow-3 text-primary" : "text-muted-foreground/40"}`}
              />
            </div>
          </div>

          <div className="text-center min-w-0">
            {isEditing ? (
              <div className="flex flex-col items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={newTargetTemp}
                  onChange={(e) => setNewTargetTemp(e.target.value)}
                  className="text-xl font-bold bg-transparent border-b-2 border-primary outline-none w-20 text-center tabular-nums"
                  placeholder="0.0"
                  autoFocus
                />
                <div className="text-xs text-muted-foreground">°C target</div>
                <div className="flex gap-1 mt-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleSetTargetTemp}
                    disabled={isPending}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleCancelEdit}
                    disabled={isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums">
                  {targetTemp !== null ? targetTemp.toFixed(1) : "--"}
                </div>
                <div className="text-xs text-muted-foreground">°C target</div>
              </>
            )}
          </div>
        </div>

        {/* Auto-stop alert (shown when PID is stopped due to a safety check) */}
        {!isActive && pidRuntimeState?.lastStopReason && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <div className="font-medium">
              {pidRuntimeState.lastStopReason === "overheat"
                ? "Auto-stopped: overheat protection"
                : "Auto-stopped: sensor timeout"}
            </div>
            {pidRuntimeState.lastStopDetail && (
              <div className="text-xs mt-0.5">
                {pidRuntimeState.lastStopDetail}
              </div>
            )}
            {pidRuntimeState.lastStopAt && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {new Date(pidRuntimeState.lastStopAt).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* PID Parameters */}
        {pidParameters && (
          <div className="space-y-2">
            <div className="text-sm font-medium">PID Parameters</div>
            {isEditingPID ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-8">Kp</span>
                  <input
                    type="number"
                    step="0.001"
                    value={newKp}
                    onChange={(e) => setNewKp(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm font-mono bg-transparent border rounded outline-none border-primary"
                    placeholder="0.0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-8">Ki</span>
                  <input
                    type="number"
                    step="0.001"
                    value={newKi}
                    onChange={(e) => setNewKi(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm font-mono bg-transparent border rounded outline-none border-primary"
                    placeholder="0.0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-8">Kd</span>
                  <input
                    type="number"
                    step="0.001"
                    value={newKd}
                    onChange={(e) => setNewKd(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm font-mono bg-transparent border rounded outline-none border-primary"
                    placeholder="0.0"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSetPIDParams}
                    disabled={isPending}
                    className="flex-1"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelPIDEdit}
                    disabled={isPending}
                    className="flex-1"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Kp</div>
                  <div className="font-mono">{pidParameters.kp.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Ki</div>
                  <div className="font-mono">{pidParameters.ki.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Kd</div>
                  <div className="font-mono">{pidParameters.kd.toFixed(3)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PID State (visible when active) */}
        {isActive && pidRuntimeState && (
          <div className="space-y-2">
            <div className="text-sm font-medium">PID State</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {pidRuntimeState.runningForSeconds != null && (
                <>
                  <div className="text-muted-foreground">Running for</div>
                  <div
                    className="font-mono text-right tabular-nums"
                    title={
                      pidRuntimeState.startedAt
                        ? `Started ${new Date(pidRuntimeState.startedAt).toLocaleString()}`
                        : undefined
                    }
                  >
                    {formatPidRunningDuration(
                      pidRuntimeState.runningForSeconds,
                    )}
                  </div>
                </>
              )}
              {pidRuntimeState.startedAt && (
                <>
                  <div className="text-muted-foreground">Started at</div>
                  <div className="font-mono text-right text-xs leading-5">
                    {new Date(pidRuntimeState.startedAt).toLocaleString()}
                  </div>
                </>
              )}
              <div className="text-muted-foreground">Power</div>
              <div className="font-mono text-right">
                {(pidRuntimeState.power * 100).toFixed(1)}%
              </div>
              <div className="text-muted-foreground">Error</div>
              <div className="font-mono text-right">
                {pidRuntimeState.pidVariables.lastError.toFixed(3)}
              </div>
              <div className="text-muted-foreground">Integral</div>
              <div className="font-mono text-right">
                {pidRuntimeState.pidVariables.integral.toFixed(3)}
              </div>
              {pidRuntimeState.pidVariables.lastMeasurement !== null && (
                <>
                  <div className="text-muted-foreground">Last Reading</div>
                  <div className="font-mono text-right">
                    {pidRuntimeState.pidVariables.lastMeasurement.toFixed(2)} °C
                  </div>
                </>
              )}
            </div>
            {pidRuntimeState.errorStats.errorsSinceStart > 0 && (
              <div className="mt-1 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                <span className="font-medium">
                  Errors: {pidRuntimeState.errorStats.errorsLast1M}/
                  {pidRuntimeState.errorStats.errorsLast10M}/
                  {pidRuntimeState.errorStats.errorsSinceStart}
                </span>
                <span className="text-muted-foreground ml-1">
                  (1m / 10m / total)
                </span>
                {pidRuntimeState.errorStats.lastErrorMessage && (
                  <div className="mt-0.5">
                    <div
                      className={isErrorExpanded ? "break-words" : "truncate"}
                    >
                      {pidRuntimeState.errorStats.lastErrorMessage}
                    </div>
                    {hasLongErrorMessage && (
                      <button
                        type="button"
                        className="mt-1 underline underline-offset-2 text-destructive"
                        onClick={() => setIsErrorExpanded((v) => !v)}
                      >
                        {isErrorExpanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2">
        {!isEditing && !isEditingPID && (
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditing(true)}
              disabled={isPending || isExperimentLocked}
              title={isExperimentLocked ? lockedTooltip : undefined}
            >
              Edit Target
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleEditPID}
              disabled={isPending || isExperimentLocked}
              title={isExperimentLocked ? lockedTooltip : undefined}
            >
              Edit PID
            </Button>
          </div>
        )}
        {!isEditingPID && (
          <>
            {activeExperiment ? (
              <Button
                onClick={handleStopExperiment}
                disabled={isPending}
                variant="destructive"
                className="w-full"
              >
                {isPending ? (
                  "..."
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Experiment
                  </>
                )}
              </Button>
            ) : isActive ? (
              <Button
                onClick={handleTogglePID}
                disabled={isPending}
                variant="destructive"
                className="w-full"
              >
                {isPending ? (
                  "..."
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop
                  </>
                )}
              </Button>
            ) : (
              <div className="flex w-full gap-2">
                <Button
                  onClick={() => setStartDialogOpen(true)}
                  disabled={isPending}
                  variant="default"
                  className="flex-1"
                >
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Start Experiment
                </Button>
                <Button
                  onClick={handleTogglePID}
                  disabled={isPending}
                  variant="outline"
                  className="flex-1"
                  title="Start PID without an experiment"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
              </div>
            )}
          </>
        )}
      </CardFooter>

      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Experiment</DialogTitle>
            <DialogDescription>
              Starts the PID loop and records this run with the current target (
              {targetTemp?.toFixed(1) ?? "--"}°C) and PID parameters as a
              snapshot. Target and PID values are locked while the experiment is
              running.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="experiment-name">Name</Label>
            <Input
              id="experiment-name"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              placeholder="e.g. tuning-run-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleStartExperiment();
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStartDialogOpen(false);
                setExperimentName("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleStartExperiment} disabled={isPending}>
              {isPending ? "Starting..." : "Start"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
