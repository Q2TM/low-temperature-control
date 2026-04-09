CREATE TABLE "heater_metrics" (
	"time" timestamp with time zone NOT NULL,
	"system_id" text NOT NULL,
	"channel" integer NOT NULL,
	"power_watts" double precision,
	"metadata" jsonb,
	CONSTRAINT "heater_metrics_time_system_id_channel_pk" PRIMARY KEY("time","system_id","channel")
);
--> statement-breakpoint
CREATE TABLE "system_heaters" (
	"system_id" text NOT NULL,
	"channel" integer NOT NULL,
	"label" text,
	CONSTRAINT "system_heaters_system_id_channel_pk" PRIMARY KEY("system_id","channel")
);
--> statement-breakpoint
CREATE TABLE "system_thermos" (
	"system_id" text NOT NULL,
	"channel" integer NOT NULL,
	"label" text,
	CONSTRAINT "system_thermos_system_id_channel_pk" PRIMARY KEY("system_id","channel")
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
CREATE TABLE "thermo_metrics" (
	"time" timestamp with time zone NOT NULL,
	"system_id" text NOT NULL,
	"channel" integer NOT NULL,
	"temp_kelvin" double precision,
	"metadata" jsonb,
	CONSTRAINT "thermo_metrics_time_system_id_channel_pk" PRIMARY KEY("time","system_id","channel")
);
--> statement-breakpoint
ALTER TABLE "heater_metrics" ADD CONSTRAINT "heater_metrics_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_heaters" ADD CONSTRAINT "system_heaters_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_thermos" ADD CONSTRAINT "system_thermos_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thermo_metrics" ADD CONSTRAINT "thermo_metrics_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE no action ON UPDATE no action;