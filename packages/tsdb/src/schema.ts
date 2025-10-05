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
