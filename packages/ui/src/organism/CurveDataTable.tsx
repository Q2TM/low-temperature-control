"use client";

import * as React from "react";

import { Badge } from "@repo/ui/atom/badge";
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
  isEditing: boolean;
  isSaving?: boolean;
  modifiedIndices: Set<number>;
  onDataPointChange: (
    index: number,
    field: "temperature" | "sensor",
    value: number,
  ) => void;
  onCsvUpload: (file: File) => void;
  onEdit: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onAddRow: () => void;
}

export function CurveDataTable({
  dataPoints,
  isEditing,
  isSaving = false,
  modifiedIndices,
  onDataPointChange,
  onCsvUpload,
  onEdit,
  onSave,
  onDiscard,
  onAddRow,
}: CurveDataTableProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCsvUpload(file);
      e.target.value = "";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Data Points Editor</CardTitle>
            {modifiedIndices.size > 0 && (
              <Badge variant="secondary">{modifiedIndices.size} modified</Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={onSave}
                  disabled={isSaving || modifiedIndices.size === 0}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDiscard}
                  disabled={isSaving}
                >
                  Discard
                </Button>
              </>
            ) : (
              <Button size="sm" variant="secondary" onClick={onEdit}>
                Edit
              </Button>
            )}
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              const csv = dataPoints
                .map((p) => `${p.sensor},${p.temperature}`)
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "curve-data.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={dataPoints.length === 0}
          >
            Download CSV
          </Button>
          {isEditing && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload CSV
              </Button>
            </>
          )}
        </div>
        {isEditing && (
          <p className="text-xs text-muted-foreground mt-1">
            CSV format: two columns (sensor, temperature) with no header. Each
            row is one data point, up to 200 rows.
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 border-b">
            <TableRow>
              <TableHead className="w-[60px] bg-background">#</TableHead>
              <TableHead className="bg-background">Res (Ω)</TableHead>
              <TableHead className="bg-background">Temp (K)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataPoints.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground h-[200px]"
                >
                  No data points available
                </TableCell>
              </TableRow>
            ) : (
              dataPoints.map((point) => {
                const isModified = modifiedIndices.has(point.index);
                return (
                  <TableRow
                    key={point.index}
                    className={isModified ? "bg-yellow-500/10" : undefined}
                  >
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-1.5">
                        {isModified && (
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                        )}
                        {point.index}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
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
                        <span className="text-sm">
                          {point.sensor.toFixed(3)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
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
                  </TableRow>
                );
              })
            )}
            {isEditing && dataPoints.length < 200 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    onClick={onAddRow}
                  >
                    + Add Row
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
