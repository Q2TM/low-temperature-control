import { Static, t } from "elysia";

// Temperature metrics query request
export const QueryTempMetricsRequest = t.Object({
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

// Heater metrics query request
export const QueryHeaterMetricsRequest = t.Object({
  pins: t.Array(t.Number(), {
    description: "List of pin numbers to retrieve",
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

// Temperature metrics response
export const QueryTempMetricsResponse = t.Object({
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

// Heater metrics response
export const QueryHeaterMetricsResponse = t.Object({
  dataPoints: t.Number({
    description: "Total number of data points returned",
  }),
  metrics: t.Array(
    t.Object({
      time: t.String({
        description: "Timestamp of the metric",
        format: "date-time",
      }),
      pins: t.Array(
        t.Object({
          pinNumber: t.Number({
            description: "Pin number",
          }),
          dutyCycle: t.Number({
            description: "Duty cycle (0-1)",
          }),
          powerWatts: t.Number({
            description: "Power in Watts",
          }),
        }),
      ),
    }),
  ),
});

export type QueryTempMetricsResponseType = Static<
  typeof QueryTempMetricsResponse
>;
export type QueryHeaterMetricsResponseType = Static<
  typeof QueryHeaterMetricsResponse
>;
