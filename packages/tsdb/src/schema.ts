import {
  boolean,
  doublePrecision,
  integer,
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

export const systemSensors = pgTable(
  "system_sensors",
  {
    systemId: text("system_id")
      .notNull()
      .references(() => systems.id, { onDelete: "cascade" }),
    instance: text("instance").notNull(),
    channel: integer("channel").notNull(),
    label: text("label"),
  },
  (table) => [
    primaryKey({ columns: [table.systemId, table.instance, table.channel] }),
  ],
);

export const systemHeaters = pgTable(
  "system_heaters",
  {
    systemId: text("system_id")
      .notNull()
      .references(() => systems.id, { onDelete: "cascade" }),
    instance: text("instance").notNull(),
    channelId: integer("channel_id").notNull(),
    label: text("label"),
  },
  (table) => [
    primaryKey({ columns: [table.systemId, table.instance, table.channelId] }),
  ],
);

// ─── Time-Series Metrics Tables ─────────────────────────────────

export const sensorMetrics = pgTable(
  "sensor_metrics",
  {
    time: timestamp("time", { withTimezone: true }).notNull(),
    instance: text("instance").notNull(),
    channel: integer("channel").notNull(),
    tempKelvin: doublePrecision("temp_kelvin"),
    resistanceOhms: doublePrecision("resistance_ohms"),
  },
  (table) => [
    primaryKey({ columns: [table.time, table.instance, table.channel] }),
  ],
);

export const heaterMetrics = pgTable(
  "heater_metrics",
  {
    time: timestamp("time", { withTimezone: true }).notNull(),
    instance: text("instance").notNull(),
    pinNumber: integer("pin_number").notNull(),
    dutyCycle: doublePrecision("duty_cycle"),
    powerWatts: doublePrecision("power_watts"),
  },
  (table) => [
    primaryKey({ columns: [table.time, table.instance, table.pinNumber] }),
  ],
);
