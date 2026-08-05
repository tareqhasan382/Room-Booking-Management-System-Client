import { format, parse } from "date-fns";

/**
 * Accepts an ISO/Date value or an "MM/dd/yyyy" string (the format the
 * calendar sends) and returns a valid Date, or the original value when it
 * cannot be parsed.
 */
export function parseFlexible(value) {
  if (value instanceof Date) return value;
  if (typeof value !== "string") return value;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d;
  }
  const parsed = parse(value, "MM/dd/yyyy", new Date());
  return isNaN(parsed.getTime()) ? value : parsed;
}

/** Formats a date value for display: "MMM d, yyyy". */
export function formatDisplay(value) {
  const d = parseFlexible(value);
  if (d instanceof Date) {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return String(value ?? "");
}

/** Formats a Date for display: "MMM d, yyyy". */
export function formatDate(d) {
  return format(d, "MMM d, yyyy");
}

/**
 * Combines a date value with a 24h "HH:mm" time string into a full Date.
 * Falls back to 14:00 when the time cannot be parsed.
 */
export function combineDateTime(dateValue, time = "14:00") {
  const base = parseFlexible(dateValue);
  if (!(base instanceof Date)) return base;
  const [h = 14, m = 0] = String(time)
    .split(":")
    .map((p) => Number(p));
  const d = new Date(base);
  d.setHours(Number.isFinite(h) ? h : 14, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
}

/** Formats a "HH:mm" string for display: "2:00 PM". */
export function formatTimeDisplay(time) {
  if (!time) return "—";
  const [h = 0, m = 0] = String(time).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** Validates a "HH:mm" time string, returning it or null. */
export function validateTime(time) {
  if (typeof time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null;
  }
  return time;
}
