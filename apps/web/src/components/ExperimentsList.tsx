"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChartLine,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@repo/ui/atom/badge";
import { Button } from "@repo/ui/atom/button";
import { Input } from "@repo/ui/atom/input";
import { Label } from "@repo/ui/atom/label";
import { Skeleton } from "@repo/ui/atom/skeleton";
import { Textarea } from "@repo/ui/atom/textarea";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/molecule/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/molecule/table";

import {
  deleteExperiment,
  type Experiment,
  type ExperimentStatus,
  listExperiments,
  updateExperiment,
} from "@/actions/experiments";

const PAGE_SIZE = 25;

type StatusFilter = "all" | ExperimentStatus;

function formatDuration(start: string, end: string | null): string {
  const startMs = new Date(start).getTime();
  const endMs = end ? new Date(end).getTime() : Date.now();
  const sec = Math.max(0, Math.floor((endMs - startMs) / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function statusVariant(
  status: ExperimentStatus,
): "default" | "secondary" | "destructive" {
  if (status === "running") return "default";
  if (status === "completed") return "secondary";
  return "destructive";
}

type ExperimentsListProps = {
  systemId: string;
};

export function ExperimentsList({ systemId }: ExperimentsListProps) {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilterState] = useState<StatusFilter>("all");
  const [nameQuery, setNameQuery] = useState("");
  // useDeferredValue gives us free debouncing tied to React's scheduler so we
  // don't refetch on every keystroke.
  const deferredName = useDeferredValue(nameQuery.trim());
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Experiment | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [deleting, setDeleting] = useState<Experiment | null>(null);

  const setStatusFilter = (v: StatusFilter) => {
    setStatusFilterState(v);
    setPage(0);
  };

  const handleNameChange = (v: string) => {
    setNameQuery(v);
    setPage(0);
  };

  const query = useQuery({
    queryKey: [
      "experiments",
      systemId,
      statusFilter,
      deferredName,
      page,
    ] as const,
    queryFn: ({ queryKey }) => {
      const [, sId, status, name, p] = queryKey;
      return listExperiments({
        systemId: sId,
        status: status === "all" ? undefined : status,
        nameContains: name || undefined,
        limit: PAGE_SIZE,
        offset: p * PAGE_SIZE,
      });
    },
  });

  const experiments = query.data?.experiments ?? null;
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const refetch = () => void query.refetch();

  const handleEdit = (exp: Experiment) => {
    setEditing(exp);
    setEditName(exp.name);
    setEditNotes(exp.notes ?? "");
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    const name = editName.trim();
    if (!name) {
      toast.error("Name is required");
      return;
    }
    startTransition(async () => {
      const result = await updateExperiment(editing.id, {
        name,
        notes: editNotes.trim() || null,
      });
      if (result.success) {
        setEditing(null);
        refetch();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteExperiment(deleting.id);
      if (result.success) {
        setDeleting(null);
        refetch();
      } else {
        toast.error(result.error);
      }
    });
  };

  const renderRow = (exp: Experiment) => {
    const params =
      exp.startKp != null && exp.startKi != null && exp.startKd != null
        ? `${exp.startKp.toFixed(3)} / ${exp.startKi.toFixed(3)} / ${exp.startKd.toFixed(3)}`
        : "—";
    const setpoint =
      exp.startSetpoint != null ? `${exp.startSetpoint.toFixed(1)}°C` : "—";
    const startedLabel = new Date(exp.startedAt).toLocaleString();

    // Build the URL for "View on chart": deep-link the dashboard with the
    // experiment's time range. For running experiments, jump to the moment
    // up to "now" so the chart keeps growing.
    const expEnd = exp.endedAt ?? new Date().toISOString();
    const chartHref = `/${systemId}?expStart=${encodeURIComponent(exp.startedAt)}&expEnd=${encodeURIComponent(expEnd)}`;

    return (
      <TableRow key={exp.id}>
        <TableCell className="font-medium max-w-[18rem]">
          <div className="truncate" title={exp.name}>
            {exp.name}
          </div>
          {exp.notes && (
            <div
              className="text-xs text-muted-foreground truncate"
              title={exp.notes}
            >
              {exp.notes}
            </div>
          )}
        </TableCell>
        <TableCell>
          <Badge variant={statusVariant(exp.status)}>{exp.status}</Badge>
          {exp.stopReason && exp.stopReason !== "manual" && (
            <div
              className="mt-1 text-xs text-muted-foreground"
              title={exp.stopDetail ?? undefined}
            >
              {exp.stopReason}
            </div>
          )}
        </TableCell>
        <TableCell className="tabular-nums whitespace-nowrap text-xs">
          {startedLabel}
        </TableCell>
        <TableCell className="tabular-nums whitespace-nowrap text-xs">
          {formatDuration(exp.startedAt, exp.endedAt)}
        </TableCell>
        <TableCell className="tabular-nums whitespace-nowrap">
          {setpoint}
        </TableCell>
        <TableCell className="tabular-nums whitespace-nowrap text-xs font-mono">
          {params}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            <Button asChild size="sm" variant="outline" title="View on chart">
              <Link href={chartHref}>
                <ChartLine className="size-3.5" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(exp)}
              title="Edit name / notes"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleting(exp)}
              disabled={exp.status === "running"}
              title={
                exp.status === "running"
                  ? "Stop the experiment before deleting"
                  : "Delete"
              }
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>Experiments</CardTitle>
              <CardDescription>
                Browse past PID runs for this system. Click the chart icon to
                load a run on the dashboard.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isPending || query.isFetching}
            >
              <RefreshCw className="size-3.5 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="exp-name-search" className="text-xs">
                Search name
              </Label>
              <Input
                id="exp-name-search"
                value={nameQuery}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. tuning"
                className="w-64"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="aborted">Aborted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              {total} {total === 1 ? "experiment" : "experiments"}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Setpoint</TableHead>
                  <TableHead>Kp / Ki / Kd</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiments === null ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : experiments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-12"
                    >
                      No experiments match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  experiments.map(renderRow)
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isPending}
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page + 1 >= totalPages || isPending}
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Experiment</DialogTitle>
            <DialogDescription>
              Only name and notes are editable. Timing and PID snapshot are
              immutable.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Experiment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleting?.name}&quot;? This
              cannot be undone. Time-series metrics for the run are not
              affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
