import {
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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
