export type Resolution = {
  value: number; // seconds
  label: string;
};

export const ALL_RESOLUTIONS: Resolution[] = [
  { value: 1, label: "1 second" },
  { value: 5, label: "5 seconds" },
  { value: 10, label: "10 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 900, label: "15 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
];

const MIN_DATA_POINTS = 50;
const MAX_DATA_POINTS = 2000;
const TARGET_DATA_POINTS = 400;

export function getAvailableResolutions(spanMs: number): {
  available: Resolution[];
  defaultResolution: Resolution;
} {
  const spanSeconds = spanMs / 1000;

  const available = ALL_RESOLUTIONS.filter((r) => {
    const points = spanSeconds / r.value;
    return points >= MIN_DATA_POINTS && points <= MAX_DATA_POINTS;
  });

  if (available.length === 0) {
    const closest = ALL_RESOLUTIONS.reduce((best, r) => {
      const bestDist = Math.abs(spanSeconds / best.value - TARGET_DATA_POINTS);
      const dist = Math.abs(spanSeconds / r.value - TARGET_DATA_POINTS);
      return dist < bestDist ? r : best;
    });
    return { available: [closest], defaultResolution: closest };
  }

  const defaultResolution = available.reduce((best, r) => {
    const bestDist = Math.abs(spanSeconds / best.value - TARGET_DATA_POINTS);
    const dist = Math.abs(spanSeconds / r.value - TARGET_DATA_POINTS);
    return dist < bestDist ? r : best;
  });

  return { available, defaultResolution };
}

export function estimateDataPoints(
  spanMs: number,
  resolutionSeconds: number,
): number {
  return Math.round(spanMs / 1000 / resolutionSeconds);
}

// --- Time range types and presets ---

export type TimeRange =
  | { mode: "relative"; minutes: number }
  | { mode: "absolute"; start: number; end: number };

export type TimeRangePreset = {
  label: string;
  minutes: number;
};

export const TIME_RANGE_PRESETS: TimeRangePreset[] = [
  { label: "Last 5 minutes", minutes: 5 },
  { label: "Last 10 minutes", minutes: 10 },
  { label: "Last 15 minutes", minutes: 15 },
  { label: "Last 30 minutes", minutes: 30 },
  { label: "Last 1 hour", minutes: 60 },
  { label: "Last 3 hours", minutes: 180 },
  { label: "Last 6 hours", minutes: 360 },
  { label: "Last 12 hours", minutes: 720 },
  { label: "Last 24 hours", minutes: 1440 },
  { label: "Last 7 days", minutes: 10080 },
];

export function getTimeSpanMs(range: TimeRange): number {
  return range.mode === "relative"
    ? range.minutes * 60_000
    : range.end - range.start;
}

export function formatTimeframeLabel(range: TimeRange): string {
  if (range.mode === "relative") {
    const preset = TIME_RANGE_PRESETS.find((p) => p.minutes === range.minutes);
    if (preset) return preset.label;
    if (range.minutes < 60) return `Last ${range.minutes} min`;
    if (range.minutes < 1440)
      return `Last ${(range.minutes / 60).toFixed(0)} hours`;
    return `Last ${(range.minutes / 1440).toFixed(0)} days`;
  }

  const start = new Date(range.start);
  const end = new Date(range.end);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    const datePart = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timeFmt: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return `${datePart}, ${start.toLocaleTimeString("en-US", timeFmt)} – ${end.toLocaleTimeString("en-US", timeFmt)}`;
  }

  const fmt = (d: Date) =>
    d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

// --- datetime-local helpers ---

export function toDatetimeLocalString(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalString(str: string): number {
  return new Date(str).getTime();
}
