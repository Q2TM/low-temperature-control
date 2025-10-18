CREATE TABLE "sensor_metrics" (
	"time" timestamp with time zone NOT NULL,
	"instance" text NOT NULL,
	"channel" integer NOT NULL,
	"temp_kelvin" double precision,
	"resistance_ohms" double precision,
	CONSTRAINT "sensor_metrics_time_instance_channel_pk" PRIMARY KEY("time","instance","channel")
);

-- Custom SQL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM _timescaledb_catalog.hypertable
    WHERE schema_name = 'public'
      AND table_name = 'sensor_metrics'
  ) THEN
    PERFORM create_hypertable('sensor_metrics', 'time', chunk_time_interval => interval '1 day');
    RAISE NOTICE 'Hypertable "sensor_metrics" created successfully.';
  ELSE
    RAISE NOTICE 'Hypertable "sensor_metrics" already exists. Skipping creation.';
  END IF;
END$$;

