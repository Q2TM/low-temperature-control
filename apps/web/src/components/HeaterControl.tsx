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

import { setTargetTemperature, startPID, stopPID } from "@/actions/heater";

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
  const [newTargetTemp, setNewTargetTemp] = useState(
    targetTemp?.toString() ?? "",
  );
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
            </div>
          )}
        </CardContent>
        <CardFooter className="gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditing(true)}
              disabled={isPending}
            >
              Edit Target
            </Button>
          )}
          <Button
            onClick={handleTogglePID}
            disabled={isPending}
            variant={isActive ? "destructive" : "default"}
            className="flex-1"
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
        </CardFooter>
      </Card>
    </>
  );
}
