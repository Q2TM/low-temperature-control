import { Static, t } from "elysia";

export const QueryMetricsRequestQuery = t.Object({
  interval: t.Number({
    description: "Interval in seconds for time bucketing",
    default: 10,
  }),
  channels: t.Array(t.Number(), {
    description: "List of channel numbers to retrieve",
  }),
  time_start: t.Date({
    description: "Start time for the query in ISO format",
  }),
  time_end: t.Date({
    description: "End time for the query in ISO format",
  }),
});

export const QueryMetricsResponse = t.Object({
  dataPoints: t.Number(),
  metrics: t.Array(
    t.Object({
      time: t.String(),
      channels: t.Array(
        t.Object({
          channel: t.Number(),
          kelvin: t.Number(),
          resistance: t.Number(),
        }),
      ),
    }),
  ),
});

export type QueryMetricsResponseType = Static<typeof QueryMetricsResponse>;
