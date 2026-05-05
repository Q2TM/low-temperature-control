/**
 * Minimal typed wrapper over the rice-shower HTTP API. We intentionally
 * keep this hand-written (rather than codegen) so e2e suites stay
 * decoupled from the openapi-fetch toolchain inside rice-shower itself.
 */

export type CreateSystemInput = {
  id: string;
  displayName: string;
  location?: string | null;
  thermoUrl: string;
  heaterUrl: string;
  enabled?: boolean;
  thermos: { channel: number; label: string | null }[];
  heaters: { channel: number; label: string | null }[];
};

export type ThermoMetricsResponse = {
  dataPoints: number;
  metrics: {
    time: string;
    channels: { channel: number; kelvin: number }[];
  }[];
};

export type HeaterMetricsResponse = {
  dataPoints: number;
  metrics: {
    time: string;
    channels: {
      channel: number;
      powerWatts: number;
      powerPercent: number;
    }[];
  }[];
};

export type WindowedScrapeStatus = {
  systemId: string;
  startedAt: string;
  thermo: {
    successLast1M: number;
    successLast10M: number;
    successTotal: number;
    errorsLast1M: number;
    errorsLast10M: number;
    errorsTotal: number;
    lastError: string | null;
    lastErrorMessage: string | null;
  };
  heater: {
    successLast1M: number;
    successLast10M: number;
    successTotal: number;
    errorsLast1M: number;
    errorsLast10M: number;
    errorsTotal: number;
    lastError: string | null;
    lastErrorMessage: string | null;
  };
};

export class RiceShowerClient {
  constructor(private readonly baseUrl: string) {}

  async createSystem(input: CreateSystemInput) {
    const res = await fetch(`${this.baseUrl}/systems/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error(
        `POST /systems failed (${res.status}): ${await res.text()}`,
      );
    }
    return res.json();
  }

  async getThermoMetrics(
    systemId: string,
    params: {
      channels: number[];
      timeStart: Date;
      timeEnd: Date;
      interval?: number;
    },
  ): Promise<ThermoMetricsResponse> {
    const url = new URL(`${this.baseUrl}/query/thermo/${systemId}`);
    for (const ch of params.channels)
      url.searchParams.append("channels", `${ch}`);
    url.searchParams.set("time_start", params.timeStart.toISOString());
    url.searchParams.set("time_end", params.timeEnd.toISOString());
    url.searchParams.set("interval", `${params.interval ?? 1}`);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `GET /query/thermo failed (${res.status}): ${await res.text()}`,
      );
    }
    return res.json() as Promise<ThermoMetricsResponse>;
  }

  async getHeaterMetrics(
    systemId: string,
    params: {
      channels: number[];
      timeStart: Date;
      timeEnd: Date;
      interval?: number;
    },
  ): Promise<HeaterMetricsResponse> {
    const url = new URL(`${this.baseUrl}/query/heater/${systemId}`);
    for (const ch of params.channels)
      url.searchParams.append("channels", `${ch}`);
    url.searchParams.set("time_start", params.timeStart.toISOString());
    url.searchParams.set("time_end", params.timeEnd.toISOString());
    url.searchParams.set("interval", `${params.interval ?? 1}`);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `GET /query/heater failed (${res.status}): ${await res.text()}`,
      );
    }
    return res.json() as Promise<HeaterMetricsResponse>;
  }

  async getScrapeStatus(systemId: string): Promise<WindowedScrapeStatus> {
    const res = await fetch(`${this.baseUrl}/scrape/status/${systemId}`);
    if (!res.ok) {
      throw new Error(
        `GET /scrape/status failed (${res.status}): ${await res.text()}`,
      );
    }
    return res.json() as Promise<WindowedScrapeStatus>;
  }
}
