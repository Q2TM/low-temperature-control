import { t } from "elysia";

export const SystemThermoModel = t.Object({
  channel: t.Number({ description: "Thermometer channel number" }),
  label: t.Nullable(
    t.String({ description: "Display label for this thermometer" }),
  ),
});

export const SystemHeaterModel = t.Object({
  channel: t.Number({ description: "Heater channel number" }),
  label: t.Nullable(t.String({ description: "Display label for this heater" })),
});

export const SystemModel = t.Object({
  id: t.String({ description: "Unique system slug, e.g. lab-2005" }),
  displayName: t.String({ description: "Human-readable system name" }),
  location: t.Nullable(
    t.String({ description: "Physical location description" }),
  ),
  thermoUrl: t.String({ description: "Base URL to thermo/ls-api instance" }),
  heaterUrl: t.String({ description: "Base URL to heater-api instance" }),
  enabled: t.Boolean({ description: "Whether scraping is enabled" }),
  thermos: t.Array(SystemThermoModel),
  heaters: t.Array(SystemHeaterModel),
  createdAt: t.String({
    description: "Creation timestamp",
    format: "date-time",
  }),
  updatedAt: t.String({
    description: "Last update timestamp",
    format: "date-time",
  }),
});

export const SystemListResponse = t.Array(SystemModel);

export const CreateSystemBody = t.Object({
  id: t.String({ description: "Unique system slug" }),
  displayName: t.String({ description: "Human-readable name" }),
  location: t.Optional(
    t.Nullable(t.String({ description: "Physical location" })),
  ),
  thermoUrl: t.String({ description: "Base URL to thermo/ls-api" }),
  heaterUrl: t.String({ description: "Base URL to heater-api" }),
  enabled: t.Optional(t.Boolean({ default: true })),
  thermos: t.Array(SystemThermoModel),
  heaters: t.Array(SystemHeaterModel),
});

export const UpdateSystemBody = t.Object({
  displayName: t.Optional(t.String()),
  location: t.Optional(t.Nullable(t.String())),
  thermoUrl: t.Optional(t.String()),
  heaterUrl: t.Optional(t.String()),
  enabled: t.Optional(t.Boolean()),
  thermos: t.Optional(t.Array(SystemThermoModel)),
  heaters: t.Optional(t.Array(SystemHeaterModel)),
});
