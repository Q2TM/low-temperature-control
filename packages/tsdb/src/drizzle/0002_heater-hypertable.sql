-- Custom SQL migration file, put your code below! --
SELECT create_hypertable('heater_metrics', 'time', chunk_time_interval => interval '1 day');
