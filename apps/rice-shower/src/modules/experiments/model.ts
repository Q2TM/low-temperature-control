import { Static, t } from "elysia";

export const ExperimentStatusModel = t.Union([
  t.Literal("running"),
  t.Literal("completed"),
  t.Literal("aborted"),
]);

export const ExperimentStopReasonModel = t.Union([
  t.Literal("manual"),
  t.Literal("overheat"),
  t.Literal("sensor_timeout"),
  t.Literal("external_stop"),
]);

export const ExperimentModel = t.Object({
  id: t.String({ format: "uuid", description: "Experiment id" }),
  name: t.String({ description: "User-supplied experiment name" }),
  systemId: t.String({ description: "System id" }),
  channel: t.Number({ description: "Heater channel number" }),
  status: ExperimentStatusModel,
  startedAt: t.String({
    description: "When the experiment (and PID) started",
    format: "date-time",
  }),
  endedAt: t.Nullable(
    t.String({
      description: "When the experiment ended; null while running",
      format: "date-time",
    }),
  ),
  startSetpoint: t.Nullable(
    t.Number({ description: "Target temp °C captured at start" }),
  ),
  startKp: t.Nullable(t.Number({ description: "Kp captured at start" })),
  startKi: t.Nullable(t.Number({ description: "Ki captured at start" })),
  startKd: t.Nullable(t.Number({ description: "Kd captured at start" })),
  stopReason: t.Nullable(ExperimentStopReasonModel),
  stopDetail: t.Nullable(t.String()),
  notes: t.Nullable(t.String()),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
});

export type ExperimentType = Static<typeof ExperimentModel>;

export const ExperimentListResponse = t.Object({
  total: t.Number({ description: "Total experiments matching the filter" }),
  experiments: t.Array(ExperimentModel),
});

export const ActiveExperimentResponse = t.Object({
  experiment: t.Nullable(ExperimentModel),
});

export const StartExperimentBody = t.Object({
  name: t.String({ minLength: 1, description: "Experiment name" }),
  systemId: t.String(),
  channel: t.Number(),
  notes: t.Optional(t.Nullable(t.String())),
});

export const UpdateExperimentBody = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  notes: t.Optional(t.Nullable(t.String())),
});

export const ListExperimentsQuery = t.Object({
  systemId: t.Optional(t.String()),
  channel: t.Optional(t.Number()),
  status: t.Optional(ExperimentStatusModel),
  nameContains: t.Optional(t.String()),
  startedAfter: t.Optional(t.Date()),
  startedBefore: t.Optional(t.Date()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 200, default: 50 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const ActiveExperimentQuery = t.Object({
  systemId: t.String(),
  channel: t.Number(),
});
