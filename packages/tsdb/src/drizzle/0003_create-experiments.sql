CREATE TABLE "experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"system_id" text NOT NULL,
	"channel" integer NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"start_setpoint" double precision,
	"start_kp" double precision,
	"start_ki" double precision,
	"start_kd" double precision,
	"stop_reason" text,
	"stop_detail" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "experiments_system_channel_started_idx" ON "experiments" USING btree ("system_id","channel","started_at" DESC NULLS LAST);