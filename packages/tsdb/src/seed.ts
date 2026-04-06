import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { systemHeaters, systems, systemSensors } from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(databaseUrl);
const db = drizzle(client);

async function seed() {
  console.log("Seeding system configuration...");

  // Upsert default system
  await db
    .insert(systems)
    .values({
      id: "default",
      displayName: "Lab 20-05",
      location: "20th Floor, Building 4",
      thermoUrl: "http://localhost:8000",
      heaterUrl: "http://localhost:8001",
      enabled: true,
    })
    .onConflictDoUpdate({
      target: systems.id,
      set: {
        displayName: "Lab 20-05",
        location: "20th Floor, Building 4",
        thermoUrl: "http://localhost:8000",
        heaterUrl: "http://localhost:8001",
        enabled: true,
        updatedAt: new Date(),
      },
    });

  // Upsert sensor
  await db
    .insert(systemSensors)
    .values({
      systemId: "default",
      instance: "sensor-1",
      channel: 1,
      label: "Main Thermometer",
    })
    .onConflictDoUpdate({
      target: [
        systemSensors.systemId,
        systemSensors.instance,
        systemSensors.channel,
      ],
      set: {
        label: "Main Thermometer",
      },
    });

  // Upsert heater
  await db
    .insert(systemHeaters)
    .values({
      systemId: "default",
      instance: "heater-1",
      channelId: 1,
      label: "Primary Heater",
    })
    .onConflictDoUpdate({
      target: [
        systemHeaters.systemId,
        systemHeaters.instance,
        systemHeaters.channelId,
      ],
      set: {
        label: "Primary Heater",
      },
    });

  console.log("Seed complete.");
}

await seed();
await client.end();
