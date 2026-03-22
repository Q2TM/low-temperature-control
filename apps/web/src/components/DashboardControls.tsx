"use client";

import { Download } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@repo/ui/atom/button";
import { Label } from "@repo/ui/atom/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/molecule/select";

import {
  estimateDataPoints,
  fromDatetimeLocalString,
  getAvailableResolutions,
  getTimeSpanMs,
  TIME_RANGE_PRESETS,
  type TimeRange,
  toDatetimeLocalString,
} from "@/libs/timeConfig";

type DashboardControlsProps = {
  selectedPin: number;
  onPinChange: (pin: number) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  timeInterval: number;
  onTimeIntervalChange: (interval: number) => void;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  onDownloadCsv: () => void;
};

export function DashboardControls({
  // selectedPin,
  // onPinChange,
  timeRange,
  onTimeRangeChange,
  timeInterval,
  onTimeIntervalChange,
  refreshInterval,
  onRefreshIntervalChange,
  onDownloadCsv,
}: DashboardControlsProps) {
  const [showCustom, setShowCustom] = useState(timeRange.mode === "absolute");
  const [customStart, setCustomStart] = useState(() =>
    toDatetimeLocalString(
      timeRange.mode === "absolute"
        ? timeRange.start
        : Date.now() - timeRange.minutes * 60_000,
    ),
  );
  const [customEnd, setCustomEnd] = useState(() =>
    toDatetimeLocalString(
      timeRange.mode === "absolute" ? timeRange.end : Date.now(),
    ),
  );

  const spanMs = getTimeSpanMs(timeRange);
  const { available: availableResolutions } = useMemo(
    () => getAvailableResolutions(spanMs),
    [spanMs],
  );
  const estimatedPoints = estimateDataPoints(spanMs, timeInterval);

  const selectValue =
    timeRange.mode === "relative" ? timeRange.minutes.toString() : "custom";

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      setCustomStart(
        toDatetimeLocalString(
          timeRange.mode === "absolute"
            ? timeRange.start
            : Date.now() - timeRange.minutes * 60_000,
        ),
      );
      setCustomEnd(
        toDatetimeLocalString(
          timeRange.mode === "absolute" ? timeRange.end : Date.now(),
        ),
      );
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    onTimeRangeChange({ mode: "relative", minutes: Number(value) });
  };

  const handleApplyCustom = () => {
    const start = fromDatetimeLocalString(customStart);
    const end = fromDatetimeLocalString(customEnd);
    if (isNaN(start) || isNaN(end)) {
      alert("Please enter valid dates");
      return;
    }
    if (start >= end) {
      alert("Start time must be before end time");
      return;
    }
    onTimeRangeChange({ mode: "absolute", start, end });
  };

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="time-range-select" className="whitespace-nowrap">
            Time Range
          </Label>
          <Select value={selectValue} onValueChange={handlePresetChange}>
            <SelectTrigger id="time-range-select" className="w-[160px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGE_PRESETS.map((preset) => (
                <SelectItem
                  key={preset.minutes}
                  value={preset.minutes.toString()}
                >
                  {preset.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom range...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="interval-select" className="whitespace-nowrap">
            Resolution
          </Label>
          <Select
            value={timeInterval.toString()}
            onValueChange={(value) => onTimeIntervalChange(Number(value))}
          >
            <SelectTrigger id="interval-select" className="w-[140px]">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              {availableResolutions.map((r) => (
                <SelectItem key={r.value} value={r.value.toString()}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            ~{estimatedPoints} pts
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="refresh-select" className="whitespace-nowrap">
            Chart refresh
          </Label>
          <Select
            value={refreshInterval.toString()}
            onValueChange={(value) => onRefreshIntervalChange(Number(value))}
          >
            <SelectTrigger id="refresh-select" className="w-[130px]">
              <SelectValue placeholder="Chart refresh interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Off</SelectItem>
              <SelectItem value="5000">5 seconds</SelectItem>
              <SelectItem value="10000">10 seconds</SelectItem>
              <SelectItem value="30000">30 seconds</SelectItem>
              <SelectItem value="60000">1 minute</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onDownloadCsv}
          title="Download CSV"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {showCustom && (
        <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-border">
          <div className="flex flex-col gap-1">
            <Label htmlFor="custom-start" className="text-xs">
              From
            </Label>
            <input
              id="custom-start"
              type="datetime-local"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1.5 text-sm bg-transparent border rounded outline-none border-input focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="custom-end" className="text-xs">
              To
            </Label>
            <input
              id="custom-end"
              type="datetime-local"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1.5 text-sm bg-transparent border rounded outline-none border-input focus:border-primary"
            />
          </div>
          <Button size="sm" onClick={handleApplyCustom}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
