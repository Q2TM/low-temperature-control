export type WaitOptions = {
  /** Total timeout in ms. Defaults to 60_000. */
  timeoutMs?: number;
  /** Poll interval in ms. Defaults to 500. */
  intervalMs?: number;
  /** Human label used in error messages. */
  label?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Poll a fetchable URL until `predicate(response)` returns truthy or we
 * time out. Network errors (e.g. ECONNREFUSED while the container is
 * still booting) are treated as "not ready yet".
 */
export async function waitForHttp(
  url: string,
  predicate: (res: Response) => boolean | Promise<boolean> = (r) => r.ok,
  opts: WaitOptions = {},
): Promise<void> {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const intervalMs = opts.intervalMs ?? 500;
  const label = opts.label ?? url;
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown = null;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (await predicate(res)) return;
      lastError = new Error(`predicate failed (status ${res.status})`);
    } catch (err) {
      lastError = err;
    }
    await sleep(intervalMs);
  }

  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for ${label}: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

/**
 * Poll a TCP host:port by attempting a fetch (works for any TCP that
 * accepts an HTTP probe and returns *something*; for raw TCP use the
 * service-specific helper, e.g. `pg_isready` shelled out separately).
 */
export async function waitFor<T>(
  fn: () => Promise<T | null | undefined>,
  opts: WaitOptions = {},
): Promise<T> {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const intervalMs = opts.intervalMs ?? 500;
  const label = opts.label ?? "condition";
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown = null;

  while (Date.now() < deadline) {
    try {
      const value = await fn();
      if (value) return value;
    } catch (err) {
      lastError = err;
    }
    await sleep(intervalMs);
  }

  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for ${label}${lastError ? `: ${lastError instanceof Error ? lastError.message : String(lastError)}` : ""}`,
  );
}
