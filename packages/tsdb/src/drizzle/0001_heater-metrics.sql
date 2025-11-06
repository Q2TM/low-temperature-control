CREATE TABLE "heater_metrics" (
	"time" timestamp with time zone NOT NULL,
	"instance" text NOT NULL,
	"pin_number" integer NOT NULL,
	"duty_cycle" double precision,
	"power_watts" double precision,
	CONSTRAINT "heater_metrics_time_instance_pin_number_pk" PRIMARY KEY("time","instance","pin_number")
);
