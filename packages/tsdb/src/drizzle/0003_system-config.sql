CREATE TABLE "system_heaters" (
	"system_id" text NOT NULL,
	"instance" text NOT NULL,
	"channel_id" integer NOT NULL,
	"label" text,
	CONSTRAINT "system_heaters_system_id_instance_channel_id_pk" PRIMARY KEY("system_id","instance","channel_id")
);
--> statement-breakpoint
CREATE TABLE "system_sensors" (
	"system_id" text NOT NULL,
	"instance" text NOT NULL,
	"channel" integer NOT NULL,
	"label" text,
	CONSTRAINT "system_sensors_system_id_instance_channel_pk" PRIMARY KEY("system_id","instance","channel")
);
--> statement-breakpoint
CREATE TABLE "systems" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"location" text,
	"thermo_url" text NOT NULL,
	"heater_url" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "system_heaters" ADD CONSTRAINT "system_heaters_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_sensors" ADD CONSTRAINT "system_sensors_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;