-- Custom SQL migration file, put your code below! --
-- Enforce at most one running experiment per (system_id, channel).
CREATE UNIQUE INDEX "experiments_one_running_per_channel"
  ON "experiments" ("system_id", "channel")
  WHERE "status" = 'running';
