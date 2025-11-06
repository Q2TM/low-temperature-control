import { Elysia, t } from "elysia";

import { getTemperature, setHeaterOutput } from "./service";

export const simulatorController = new Elysia({
  detail: {
    tags: ["Simulator"],
  },
})
  .get(
    "/temperature/:channel",
    ({ params: { channel }, status }) => {
      const temperature = getTemperature(channel);
      return temperature
        ? { temperature: temperature + 273.15, _celcius: temperature } // Convert to Kelvin
        : status(404, { error: "Channel not found" });
    },
    {
      detail: {
        operationId: "getSimulatorTemperature",
        summary: "Get Simulator Temperature",
        description: "Retrieve simulated temperature for a given channel",
      },
      params: t.Object({
        channel: t.Number({
          description:
            "Lakeshore Channel number to retrieve the simulated temperature for",
        }),
      }),
      response: {
        200: t.Object({
          temperature: t.Number({
            description: "Simulated temperature in Kelvin",
          }),
          _celcius: t.Number({
            description:
              "Simulated temperature in Celsius (For testing purposes)",
          }),
        }),
        404: t.Object({
          error: t.String({
            examples: ["Channel not found"],
          }),
        }),
      },
    },
  )
  .post(
    "/heater/:pin",
    ({ params: { pin }, body: { value }, status }) => {
      const success = setHeaterOutput(pin, value);
      return success
        ? { success: true }
        : status(404, { error: "Pin not found" });
    },
    {
      detail: {
        operationId: "setHeaterOutput",
        summary: "Set Heater Output",
        description: "Set the heater output level for a given GPIO pin",
      },
      params: t.Object({
        pin: t.Number({
          description: "GPIO pin number associated with the heater",
        }),
      }),
      body: t.Object({
        value: t.Number({
          description: "Heater output level (0.0 to 1.0)",
          minimum: 0,
          maximum: 1,
        }),
      }),
      response: {
        200: t.Object({
          success: t.Literal(true),
        }),
        404: t.Object({
          error: t.String({
            examples: ["Pin not found"],
          }),
        }),
      },
    },
  );
