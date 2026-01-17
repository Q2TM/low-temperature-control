"use client";

import { Label } from "@repo/ui/atom/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/molecule/select";

type DashboardControlsProps = {
  selectedPin: number;
  onPinChange: (pin: number) => void;
  timeInterval: number;
  onTimeIntervalChange: (interval: number) => void;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  timeRange: number;
  onTimeRangeChange: (range: number) => void;
};

export function DashboardControls({
  // selectedPin,
  // onPinChange,
  timeInterval,
  onTimeIntervalChange,
  refreshInterval,
  onRefreshIntervalChange,
  timeRange,
  onTimeRangeChange,
}: DashboardControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Label htmlFor="time-range-select" className="whitespace-nowrap">
          Time Range
        </Label>
        <Select
          value={timeRange.toString()}
          onValueChange={(value) => onTimeRangeChange(Number(value))}
        >
          <SelectTrigger id="time-range-select" className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 minutes</SelectItem>
            <SelectItem value="10">10 minutes</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="interval-select" className="whitespace-nowrap">
          Data Resolution
        </Label>
        <Select
          value={timeInterval.toString()}
          onValueChange={(value) => onTimeIntervalChange(Number(value))}
        >
          <SelectTrigger id="interval-select" className="w-[140px]">
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 second</SelectItem>
            <SelectItem value="5">5 seconds</SelectItem>
            <SelectItem value="10">10 seconds</SelectItem>
            <SelectItem value="30">30 seconds</SelectItem>
            <SelectItem value="60">1 minute</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="refresh-select" className="whitespace-nowrap">
          Refresh Rate
        </Label>
        <Select
          value={refreshInterval.toString()}
          onValueChange={(value) => onRefreshIntervalChange(Number(value))}
        >
          <SelectTrigger id="refresh-select" className="w-[140px]">
            <SelectValue placeholder="Select refresh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5000">5 seconds</SelectItem>
            <SelectItem value="10000">10 seconds</SelectItem>
            <SelectItem value="30000">30 seconds</SelectItem>
            <SelectItem value="60000">1 minute</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
