import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── System Configuration Tables ────────────────────────────────

export const systems = pgTable("systems", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  location: text("location"),
  thermoUrl: text("thermo_url").notNull(),
  heaterUrl: text("heater_url").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const systemThermos = pgTable(
  "system_thermos",
  {
    systemId: text("system_id")
      .notNull()
      .references(() => systems.id, { onDelete: "cascade" }),
    channel: integer("channel").notNull(),
    label: text("label"),
  },
  (table) => [primaryKey({ columns: [table.systemId, table.channel] })],
);

export const systemHeaters = pgTable(
  "system_heaters",
  {
    systemId: text("system_id")
      .notNull()
      .references(() => systems.id, { onDelete: "cascade" }),
    channel: integer("channel").notNull(),
    label: text("label"),
  },
  (table) => [primaryKey({ columns: [table.systemId, table.channel] })],
);

// ─── Time-Series Metrics Hypertables ────────────────────────────

export const thermoMetrics = pgTable(
  "thermo_metrics",
  {
    time: timestamp("time", { withTimezone: true }).notNull(),
    systemId: text("system_id")
      .notNull()
      .references(() => systems.id),
    channel: integer("channel").notNull(),
    tempKelvin: doublePrecision("temp_kelvin"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  },
  (table) => [
    primaryKey({ columns: [table.time, table.systemId, table.channel] }),
  ],
);

export const heaterMetrics = pgTable(
  "heater_metrics",
  {
    time: timestamp("time", { withTimezone: true }).notNull(),
    systemId: text("system_id")
      .notNull()
      .references(() => systems.id),
    channel: integer("channel").notNull(),
    powerWatts: doublePrecision("power_watts"),
    powerPercent: doublePrecision("power_percent"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  },
  (table) => [
    primaryKey({ columns: [table.time, table.systemId, table.channel] }),
  ],
);
