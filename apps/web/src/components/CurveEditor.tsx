"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@repo/ui/base/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/base/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/base/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/base/select";
import { Spinner } from "@repo/ui/base/spinner";
import { CurveChart } from "@repo/ui/components/molecule/CurveChart";
import {
  type CurveDataPoint,
  CurveDataTable,
} from "@repo/ui/components/molecule/CurveDataTable";
import {
  CurveHeaderForm,
  type CurveHeaderFormValues,
} from "@repo/ui/components/molecule/CurveHeaderForm";

import {
  deleteCurve,
  getAllCurveDataPoints,
  getCurveHeader,
  setCurveDataPoint,
  setCurveHeader,
} from "@/actions/lakeshore";

const CHANNELS = [1, 2, 3, 4, 5, 6, 7, 8];

export function CurveEditor() {
  const [selectedChannel, setSelectedChannel] = useState<number>(1);
  const [curveHeader, setCurveHeaderState] =
    useState<CurveHeaderFormValues | null>(null);
  const [dataPoints, setDataPoints] = useState<CurveDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHeaderLoading, setIsHeaderLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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
      } else {
        setDataPoints([]);
      }
    } catch (error) {
      console.error("Failed to load curve data:", error);
      setCurveHeaderState(null);
      setDataPoints([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurveData(selectedChannel);
  }, [selectedChannel, loadCurveData]);

  const handleChannelChange = (value: string) => {
    setSelectedChannel(parseInt(value));
    setEditingIndex(null);
  };

  const handleHeaderSubmit = async (data: CurveHeaderFormValues) => {
    setIsHeaderLoading(true);
    try {
      const result = await setCurveHeader(selectedChannel, data);
      if (result.success) {
        setCurveHeaderState(data);
        // Show success message
        console.log("Curve header updated successfully");
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
  };

  const handleSaveDataPoint = async (index: number) => {
    const point = dataPoints.find((p) => p.index === index);
    if (!point) return;

    try {
      const result = await setCurveDataPoint(selectedChannel, index, {
        temperature: point.temperature,
        sensor: point.sensor,
      });

      if (result.success) {
        console.log(`Data point ${index} updated successfully`);
      } else {
        console.error("Failed to update data point:", result.error);
      }
    } catch (error) {
      console.error("Error updating data point:", error);
    }
  };

  const handleDeleteCurve = async () => {
    try {
      const result = await deleteCurve(selectedChannel);
      if (result.success) {
        console.log("Curve deleted successfully");
        setShowDeleteDialog(false);
        // Reload the curve data
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
          <CardHeader>
            <CardTitle>Channel Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label htmlFor="channel-select" className="font-medium">
                Channel:
              </label>
              <Select
                value={selectedChannel.toString()}
                onValueChange={handleChannelChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((channel) => (
                    <SelectItem key={channel} value={channel.toString()}>
                      Channel {channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {curveHeader && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  size="sm"
                  className="ml-auto"
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
              />
            </div>

            {/* Editor takes 1/3 of the space on desktop, scrollable */}
            <div className="lg:col-span-1 h-[600px] max-h-[600px]">
              <CurveDataTable
                dataPoints={dataPoints}
                onDataPointChange={handleDataPointChange}
                onSaveDataPoint={handleSaveDataPoint}
                editingIndex={editingIndex}
                setEditingIndex={setEditingIndex}
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
