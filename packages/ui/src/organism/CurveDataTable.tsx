"use client";

import * as React from "react";

import { Button } from "@repo/ui/atom/button";
import { Input } from "@repo/ui/atom/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/molecule/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/molecule/table";

export interface CurveDataPoint {
  index: number;
  temperature: number;
  sensor: number;
}

interface CurveDataTableProps {
  dataPoints: CurveDataPoint[];
  onDataPointChange: (
    index: number,
    field: "temperature" | "sensor",
    value: number,
  ) => void;
  onSaveDataPoint: (index: number) => void;
  editingIndex: number | null;
  setEditingIndex: (index: number | null) => void;
}

export function CurveDataTable({
  dataPoints,
  onDataPointChange,
  onSaveDataPoint,
  editingIndex,
  setEditingIndex,
}: CurveDataTableProps) {
  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const handleSave = (index: number) => {
    onSaveDataPoint(index);
    setEditingIndex(null);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-base">Data Points Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 border-b">
            <TableRow>
              <TableHead className="w-[80px] bg-background">Index</TableHead>
              <TableHead className="bg-background">Temp (K)</TableHead>
              <TableHead className="bg-background">Res (Ω)</TableHead>
              <TableHead className="text-right w-[100px] bg-background">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataPoints.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground h-[200px]"
                >
                  No data points available
                </TableCell>
              </TableRow>
            ) : (
              dataPoints.map((point) => (
                <TableRow key={point.index}>
                  <TableCell className="font-medium">{point.index}</TableCell>
                  <TableCell>
                    {editingIndex === point.index ? (
                      <Input
                        type="number"
                        step="0.001"
                        value={point.temperature}
                        onChange={(e) =>
                          onDataPointChange(
                            point.index,
                            "temperature",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full h-8"
                      />
                    ) : (
                      <span className="text-sm">
                        {point.temperature.toFixed(3)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === point.index ? (
                      <Input
                        type="number"
                        step="0.001"
                        value={point.sensor}
                        onChange={(e) =>
                          onDataPointChange(
                            point.index,
                            "sensor",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full h-8"
                      />
                    ) : (
                      <span className="text-sm">{point.sensor.toFixed(3)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingIndex === point.index ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSave(point.index)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(point.index)}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
