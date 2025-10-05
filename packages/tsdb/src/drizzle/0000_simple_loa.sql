CREATE TABLE "sensor_metrics" (
	"time" timestamp with time zone NOT NULL,
	"instance" text NOT NULL,
	"channel" integer NOT NULL,
	"temp_kelvin" double precision,
	"resistance_ohms" double precision,
	CONSTRAINT "sensor_metrics_time_instance_channel_pk" PRIMARY KEY("time","instance","channel")
);
