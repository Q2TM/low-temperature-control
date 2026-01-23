"use client";

import { Check, Pause, Play, X } from "lucide-react";
import { useState, useTransition } from "react";

import { Badge } from "@repo/ui/atom/badge";
import { Button } from "@repo/ui/atom/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@repo/ui/molecule/card";

import {
  setPIDParameters,
  setTargetTemperature,
  startPID,
  stopPID,
} from "@/actions/heater";

type HeaterControlProps = {
  targetTemp: number | null;
  isActive: boolean;
  pidParameters: {
    kp: number;
    ki: number;
    kd: number;
  } | null;
  onStatusChange?: () => void;
};

export default function HeaterControl({
  targetTemp,
  isActive,
  pidParameters,
  onStatusChange,
}: HeaterControlProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPID, setIsEditingPID] = useState(false);
  const [newTargetTemp, setNewTargetTemp] = useState(
    targetTemp?.toString() ?? "",
  );
  const [newKp, setNewKp] = useState(pidParameters?.kp.toString() ?? "");
  const [newKi, setNewKi] = useState(pidParameters?.ki.toString() ?? "");
  const [newKd, setNewKd] = useState(pidParameters?.kd.toString() ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSetTargetTemp = async () => {
    const temp = parseFloat(newTargetTemp);
    if (isNaN(temp) || temp < 0 || temp > 500) {
      alert("Please enter a valid temperature (0-500°C)");
      return;
    }

    startTransition(async () => {
      const result = await setTargetTemperature(temp);
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
      const result = await setPIDParameters({ kp, ki, kd });
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
      const result = isActive ? await stopPID() : await startPID();
      if (result.success) {
        onStatusChange?.();
      } else {
        alert(result.error || "Failed to toggle PID controller");
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardDescription className="text-lg">PID Controller</CardDescription>
          <CardAction>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Running" : "Stopped"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Target Temperature
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={newTargetTemp}
                  onChange={(e) => setNewTargetTemp(e.target.value)}
                  className="text-2xl font-semibold bg-transparent border-b-2 border-primary outline-none w-32"
                  placeholder="0.0"
                  autoFocus
                />
                <span className="text-2xl font-semibold">°C</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSetTargetTemp}
                  disabled={isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-2xl font-semibold">
                {targetTemp !== null ? `${targetTemp.toFixed(1)} °C` : "-- °C"}
              </div>
            )}
          </div>

          {pidParameters && (
            <div className="space-y-2">
              <div className="text-sm font-medium">PID Parameters</div>
              {isEditingPID ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">
                      Kp
                    </span>
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
                    <span className="text-sm text-muted-foreground w-8">
                      Ki
                    </span>
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
                    <span className="text-sm text-muted-foreground w-8">
                      Kd
                    </span>
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
                    <div className="font-mono">
                      {pidParameters.kp.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Ki</div>
                    <div className="font-mono">
                      {pidParameters.ki.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Kd</div>
                    <div className="font-mono">
                      {pidParameters.kd.toFixed(3)}
                    </div>
                  </div>
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
                disabled={isPending}
              >
                Edit Target
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleEditPID}
                disabled={isPending}
              >
                Edit PID
              </Button>
            </div>
          )}
          {!isEditingPID && (
            <Button
              onClick={handleTogglePID}
              disabled={isPending}
              variant={isActive ? "destructive" : "default"}
              className="w-full"
            >
              {isPending ? (
                "..."
              ) : isActive ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
