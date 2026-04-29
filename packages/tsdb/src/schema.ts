import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
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

// ─── Experiments ────────────────────────────────────────────────

export const experimentStatuses = ["running", "completed", "aborted"] as const;
export type ExperimentStatus = (typeof experimentStatuses)[number];

export const experimentStopReasons = [
  "manual",
  "overheat",
  "sensor_timeout",
  "external_stop",
] as const;
export type ExperimentStopReason = (typeof experimentStopReasons)[number];

export const experiments = pgTable(
  "experiments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    systemId: text("system_id")
      .notNull()
      .references(() => systems.id, { onDelete: "restrict" }),
    channel: integer("channel").notNull(),

    status: text("status", { enum: experimentStatuses }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),

    // PID parameters captured at start. Locked for the duration of the
    // experiment by the UI; never updated post-creation.
    startSetpoint: doublePrecision("start_setpoint"),
    startKp: doublePrecision("start_kp"),
    startKi: doublePrecision("start_ki"),
    startKd: doublePrecision("start_kd"),

    stopReason: text("stop_reason", { enum: experimentStopReasons }),
    stopDetail: text("stop_detail"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("experiments_system_channel_started_idx").on(
      table.systemId,
      table.channel,
      table.startedAt.desc(),
    ),
  ],
);
