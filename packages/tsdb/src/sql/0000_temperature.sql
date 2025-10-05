SELECT create_hypertable('sensor_metrics', 'time', chunk_time_interval => interval '1 day');
