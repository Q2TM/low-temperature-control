import { Static, t } from "elysia";

export const QueryMetricsRequestQuery = t.Object({
  channels: t.Array(t.Number(), {
    description: "List of channel numbers to retrieve",
  }),
  time_start: t.Date({
    description: "Start time for the query in ISO format",
  }),
  time_end: t.Date({
    description: "End time for the query in ISO format",
  }),
  interval: t.Number({
    description: "Interval in seconds for time bucketing",
    default: 10,
  }),
});

export const QueryMetricsResponse = t.Object({
  dataPoints: t.Number({
    description: "Total number of data points returned",
  }),
  metrics: t.Array(
    t.Object({
      time: t.String({
        description: "Timestamp of the metric",
        format: "date-time",
      }),
      channels: t.Array(
        t.Object({
          channel: t.Number({
            description: "Channel number",
          }),
          kelvin: t.Number({
            description: "Temperature in Kelvin",
          }),
          resistance: t.Number({
            description: "Resistance in Ohms",
          }),
        }),
      ),
    }),
  ),
});

export type QueryMetricsResponseType = Static<typeof QueryMetricsResponse>;
