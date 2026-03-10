"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@repo/ui/atom/button";
import { Spinner } from "@repo/ui/icon/spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/molecule/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/molecule/dialog";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/molecule/toggle-group";
import { CurveChart } from "@repo/ui/organism/CurveChart";
import {
  type CurveDataPoint,
  CurveDataTable,
} from "@repo/ui/organism/CurveDataTable";
import {
  CurveHeaderForm,
  type CurveHeaderFormValues,
} from "@repo/ui/organism/CurveHeaderForm";

import {
  deleteCurve,
  getAllCurveDataPoints,
  getCurveHeader,
  setCurveDataPoints,
  setCurveHeader,
} from "@/actions/lakeshore";

const CHANNELS = [1, 2, 3, 4, 5, 6, 7, 8];

export function CurveEditor() {
  const [selectedChannel, setSelectedChannel] = useState<number>(1);
  const [curveHeader, setCurveHeaderState] =
    useState<CurveHeaderFormValues | null>(null);
  const [dataPoints, setDataPoints] = useState<CurveDataPoint[]>([]);
  const [originalDataPoints, setOriginalDataPoints] = useState<
    CurveDataPoint[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHeaderLoading, setIsHeaderLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modifiedIndices, setModifiedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadCurveData = useCallback(async (channel: number) => {
    setIsLoading(true);
    try {
      const [header, points] = await Promise.all([
        getCurveHeader(channel),
        getAllCurveDataPoints(channel),
      ]);

      if (header) {
        setCurveHeaderState(header);
      } else {
        setCurveHeaderState(null);
      }

      if (points && points.temperatures && points.sensors) {
        const formattedPoints: CurveDataPoint[] = points.temperatures
          .map((temp, idx) => ({
            index: idx + 1,
            temperature: temp,
            sensor: points.sensors[idx] || 0,
          }))
          .filter((point) => point.temperature !== 0 || point.sensor !== 0);
        setDataPoints(formattedPoints);
        setOriginalDataPoints(formattedPoints);
      } else {
        setDataPoints([]);
        setOriginalDataPoints([]);
      }
    } catch (error) {
      console.error("Failed to load curve data:", error);
      setCurveHeaderState(null);
      setDataPoints([]);
      setOriginalDataPoints([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurveData(selectedChannel);
  }, [selectedChannel, loadCurveData]);

  const handleChannelChange = (value: string) => {
    if (isEditing) return;
    setSelectedChannel(parseInt(value));
    setModifiedIndices(new Set());
  };

  const handleHeaderSubmit = async (data: CurveHeaderFormValues) => {
    setIsHeaderLoading(true);
    try {
      const result = await setCurveHeader(selectedChannel, data);
      if (result.success) {
        setCurveHeaderState(data);
      } else {
        console.error("Failed to update curve header:", result.error);
      }
    } catch (error) {
      console.error("Error updating curve header:", error);
    } finally {
      setIsHeaderLoading(false);
    }
  };

  const handleDataPointChange = (
    index: number,
    field: "temperature" | "sensor",
    value: number,
  ) => {
    setDataPoints((prev) =>
      prev.map((point) =>
        point.index === index ? { ...point, [field]: value } : point,
      ),
    );

    // Track modification by comparing to original
    setModifiedIndices((prev) => {
      const next = new Set(prev);
      const original = originalDataPoints.find((p) => p.index === index);
      const updated =
        field === "temperature"
          ? {
              temperature: value,
              sensor: dataPoints.find((p) => p.index === index)?.sensor ?? 0,
            }
          : {
              sensor: value,
              temperature:
                dataPoints.find((p) => p.index === index)?.temperature ?? 0,
            };

      if (
        original &&
        original.temperature === updated.temperature &&
        original.sensor === updated.sensor
      ) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleEnterEditMode = () => {
    setIsEditing(true);
    setModifiedIndices(new Set());
  };

  const handleDiscard = () => {
    setDataPoints(originalDataPoints);
    setModifiedIndices(new Set());
    setIsEditing(false);
  };

  const handleAddRow = () => {
    const nextIndex =
      dataPoints.length > 0
        ? Math.max(...dataPoints.map((p) => p.index)) + 1
        : 1;
    if (nextIndex > 200) return;
    const newPoint: CurveDataPoint = {
      index: nextIndex,
      temperature: 0,
      sensor: 0,
    };
    setDataPoints((prev) => [...prev, newPoint]);
    setModifiedIndices((prev) => new Set(prev).add(nextIndex));
  };

  const handleSave = async () => {
    if (dataPoints.length === 0) return;

    setIsSaving(true);
    try {
      const result = await setCurveDataPoints(
        selectedChannel,
        dataPoints.map((p) => ({
          temperature: p.temperature,
          sensor: p.sensor,
        })),
      );

      if (result.success) {
        setOriginalDataPoints(dataPoints);
        setModifiedIndices(new Set());
        setIsEditing(false);
      } else {
        console.error("Failed to save data points:", result.error);
      }
    } catch (error) {
      console.error("Error saving data points:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") return;

      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const parsed: CurveDataPoint[] = [];
      for (let i = 0; i < Math.min(lines.length, 200); i++) {
        const parts = lines[i]!.split(/[,\t]/);
        if (parts.length < 2) continue;
        const sensor = parseFloat(parts[0]!);
        const temperature = parseFloat(parts[1]!);
        if (isNaN(sensor) || isNaN(temperature)) continue;
        parsed.push({ index: i + 1, temperature, sensor });
      }

      if (parsed.length === 0) return;

      setDataPoints(parsed);

      // Mark all uploaded points as modified
      const newModified = new Set<number>();
      for (const p of parsed) {
        const orig = originalDataPoints.find((o) => o.index === p.index);
        if (
          !orig ||
          orig.temperature !== p.temperature ||
          orig.sensor !== p.sensor
        ) {
          newModified.add(p.index);
        }
      }
      // Points that existed before but are no longer present are also modified
      for (const orig of originalDataPoints) {
        if (!parsed.find((p) => p.index === orig.index)) {
          newModified.add(orig.index);
        }
      }
      setModifiedIndices(newModified);
    };
    reader.readAsText(file);
  };

  const handleDeleteCurve = async () => {
    try {
      const result = await deleteCurve(selectedChannel);
      if (result.success) {
        setShowDeleteDialog(false);
        setIsEditing(false);
        setModifiedIndices(new Set());
        await loadCurveData(selectedChannel);
      } else {
        console.error("Failed to delete curve:", result.error);
      }
    } catch (error) {
      console.error("Error deleting curve:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Channel Selection and Curve Header in a grid on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ToggleGroup
                type="single"
                variant="outline"
                value={selectedChannel.toString()}
                onValueChange={(v) => v && handleChannelChange(v)}
                disabled={isEditing}
                className="flex-1"
              >
                {CHANNELS.map((channel) => (
                  <ToggleGroupItem
                    key={channel}
                    value={channel.toString()}
                    className="flex-1"
                  >
                    {channel}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              {curveHeader && !isEditing && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  size="sm"
                >
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {!isLoading && (
          <CurveHeaderForm
            initialData={curveHeader || undefined}
            onSubmit={handleHeaderSubmit}
            isLoading={isHeaderLoading}
          />
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Desktop: Side-by-side layout, Mobile: Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart takes 2/3 of the space on desktop */}
            <div className="lg:col-span-2 h-[600px]">
              <CurveChart
                dataPoints={dataPoints}
                curveName={curveHeader?.curveName}
                modifiedIndices={modifiedIndices}
              />
            </div>

            {/* Editor takes 1/3 of the space on desktop, scrollable */}
            <div className="lg:col-span-1 h-[600px] max-h-[600px]">
              <CurveDataTable
                dataPoints={dataPoints}
                isEditing={isEditing}
                isSaving={isSaving}
                modifiedIndices={modifiedIndices}
                onDataPointChange={handleDataPointChange}
                onCsvUpload={handleCsvUpload}
                onEdit={handleEnterEditMode}
                onSave={handleSave}
                onDiscard={handleDiscard}
                onAddRow={handleAddRow}
              />
            </div>
          </div>
        </>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Curve</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this curve? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCurve}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
