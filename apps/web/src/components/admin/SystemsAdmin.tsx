"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Badge } from "@repo/ui/atom/badge";
import { Button } from "@repo/ui/atom/button";
import { Input } from "@repo/ui/atom/input";
import { Label } from "@repo/ui/atom/label";
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
  createSystemAction,
  deleteSystemAction,
  getSystems,
  type System,
  type SystemHeater,
  type SystemThermo,
  updateSystemAction,
} from "@/actions/systems";

type FormState = {
  id: string;
  displayName: string;
  location: string;
  thermoUrl: string;
  heaterUrl: string;
  enabled: boolean;
  thermos: SystemThermo[];
  heaters: SystemHeater[];
};

const emptyForm: FormState = {
  id: "",
  displayName: "",
  location: "",
  thermoUrl: "http://localhost:8000",
  heaterUrl: "http://localhost:8001",
  enabled: true,
  thermos: [{ channel: 1, label: "" }],
  heaters: [{ channel: 1, label: "" }],
};

function systemToForm(system: System): FormState {
  return {
    id: system.id,
    displayName: system.displayName,
    location: system.location ?? "",
    thermoUrl: system.thermoUrl,
    heaterUrl: system.heaterUrl,
    enabled: system.enabled,
    thermos: system.thermos.map((s) => ({ ...s, label: s.label ?? "" })),
    heaters: system.heaters.map((h) => ({ ...h, label: h.label ?? "" })),
  };
}

export function SystemsAdmin({ initialSystems }: { initialSystems: System[] }) {
  const [systems, setSystems] = useState<System[]>(initialSystems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isPending, startTransition] = useTransition();

  const reload = async () => {
    const data = await getSystems();
    setSystems(data);
  };

  const handleCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (system: System) => {
    setEditingId(system.id);
    setForm(systemToForm(system));
    setDialogOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      const payload = {
        ...form,
        location: form.location || null,
        thermos: form.thermos.map((s) => ({
          ...s,
          label: s.label || null,
        })),
        heaters: form.heaters.map((h) => ({
          ...h,
          label: h.label || null,
        })),
      };

      const result = editingId
        ? await updateSystemAction(editingId, payload)
        : await createSystemAction(payload);

      if (result.success) {
        setDialogOpen(false);
        await reload();
      } else {
        alert(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!deletingId) return;
    startTransition(async () => {
      const result = await deleteSystemAction(deletingId);
      if (result.success) {
        setDeleteDialogOpen(false);
        setDeletingId(null);
        await reload();
      } else {
        alert(result.error);
      }
    });
  };

  const addSensor = () => {
    setForm((f) => ({
      ...f,
      thermos: [
        ...f.thermos,
        {
          channel: 1,
          label: "",
        },
      ],
    }));
  };

  const removeSensor = (index: number) => {
    setForm((f) => ({
      ...f,
      thermos: f.thermos.filter((_, i) => i !== index),
    }));
  };

  const updateSensor = (
    index: number,
    field: keyof SystemThermo,
    value: string | number,
  ) => {
    setForm((f) => ({
      ...f,
      thermos: f.thermos.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const addHeater = () => {
    setForm((f) => ({
      ...f,
      heaters: [
        ...f.heaters,
        {
          channel: 1,
          label: "",
        },
      ],
    }));
  };

  const removeHeater = (index: number) => {
    setForm((f) => ({
      ...f,
      heaters: f.heaters.filter((_, i) => i !== index),
    }));
  };

  const updateHeater = (
    index: number,
    field: keyof SystemHeater,
    value: string | number,
  ) => {
    setForm((f) => ({
      ...f,
      heaters: f.heaters.map((h, i) =>
        i === index ? { ...h, [field]: value } : h,
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Systems</h1>
          <p className="text-sm text-muted-foreground">
            Manage registered lab systems
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4 mr-2" />
          Add System
        </Button>
      </div>

      {systems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No systems configured yet. Click &quot;Add System&quot; to create
            one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {systems.map((system) => (
            <Card key={system.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{system.displayName}</CardTitle>
                    <CardDescription>
                      {system.location ?? "No location set"} &middot;{" "}
                      <code className="text-xs">{system.id}</code>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={system.enabled ? "default" : "secondary"}>
                      {system.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(system)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteConfirm(system.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Thermo URL:</span>{" "}
                    <code className="text-xs">{system.thermoUrl}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Heater URL:</span>{" "}
                    <code className="text-xs">{system.heaterUrl}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thermos:</span>{" "}
                    {system.thermos
                      .map((s) => `${s.label || "Thermo"} (ch ${s.channel})`)
                      .join(", ") || "None"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Heaters:</span>{" "}
                    {system.heaters
                      .map((h) => `${h.label || "Heater"} (ch ${h.channel})`)
                      .join(", ") || "None"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit System" : "Create System"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update system configuration"
                : "Register a new lab system"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sys-id">System ID</Label>
                <Input
                  id="sys-id"
                  value={form.id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, id: e.target.value }))
                  }
                  placeholder="lab-2005"
                  disabled={!!editingId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sys-name">Display Name</Label>
                <Input
                  id="sys-name"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  placeholder="Lab 20-05"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sys-location">Location</Label>
              <Input
                id="sys-location"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="20th Floor, Building 4"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sys-thermo">Thermo API URL</Label>
                <Input
                  id="sys-thermo"
                  value={form.thermoUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, thermoUrl: e.target.value }))
                  }
                  placeholder="http://localhost:8000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sys-heater">Heater API URL</Label>
                <Input
                  id="sys-heater"
                  value={form.heaterUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, heaterUrl: e.target.value }))
                  }
                  placeholder="http://localhost:8001"
                />
              </div>
            </div>

            {/* Thermometers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Thermometers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSensor}
                >
                  <Plus className="size-3.5 mr-1" />
                  Add
                </Button>
              </div>
              {form.thermos.map((sensor, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Channel</Label>
                    <Input
                      type="number"
                      value={sensor.channel}
                      onChange={(e) =>
                        updateSensor(
                          i,
                          "channel",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={sensor.label ?? ""}
                      onChange={(e) => updateSensor(i, "label", e.target.value)}
                      placeholder="Main Thermometer"
                    />
                  </div>
                  {form.thermos.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSensor(i)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Heaters */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Heaters</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHeater}
                >
                  <Plus className="size-3.5 mr-1" />
                  Add
                </Button>
              </div>
              {form.heaters.map((heater, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Channel</Label>
                    <Input
                      type="number"
                      value={heater.channel}
                      onChange={(e) =>
                        updateHeater(
                          i,
                          "channel",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={heater.label ?? ""}
                      onChange={(e) => updateHeater(i, "label", e.target.value)}
                      placeholder="Primary Heater"
                    />
                  </div>
                  {form.heaters.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeHeater(i)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete System</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete system &quot;{deletingId}&quot;?
              This will also remove all associated sensor and heater
              configurations. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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
