import { formatTime } from "@/lib/format";
import type { ActiveHours } from "@/types/app/playthrough";

/** Convert a local "HH:MM" time string to minutes from midnight UTC. */
export const localTimeToUtcMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
};

/** Convert minutes from midnight UTC back to a local "HH:MM" string for <input type="time">. */
export const utcMinutesToLocalTimeStr = (utcMinutes: number): string => {
  const d = new Date();
  d.setUTCHours(Math.floor(utcMinutes / 60), utcMinutes % 60, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** Format UTC minutes as a 12-hour local time string for display (e.g. "7:00 AM"). */
export const formatActiveHoursDisplay = (utcMinutes: number): string => {
  const d = new Date();
  d.setUTCHours(Math.floor(utcMinutes / 60), utcMinutes % 60, 0, 0);
  return formatTime(d);
};

/**
 * If the cursor falls outside the active window, advance it to the next window open.
 * Used when chaining queue items — applies the gap between one upgrade finishing
 * and the user being online to start the next one.
 */
export const advanceToActiveWindow = (cursor: Date, { startUtcMinutes, endUtcMinutes }: ActiveHours): Date => {
  if (startUtcMinutes === endUtcMinutes) return cursor;

  const minuteOfDay = cursor.getUTCHours() * 60 + cursor.getUTCMinutes();
  const isNormal = endUtcMinutes > startUtcMinutes;

  const isActive = isNormal
    ? minuteOfDay >= startUtcMinutes && minuteOfDay <= endUtcMinutes
    : minuteOfDay >= startUtcMinutes || minuteOfDay <= endUtcMinutes;

  if (isActive) return cursor;

  const dayStart = new Date(cursor);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayMs = 86400_000;

  if (isNormal) {
    if (minuteOfDay < startUtcMinutes) {
      return new Date(dayStart.getTime() + startUtcMinutes * 60_000);
    }
    return new Date(dayStart.getTime() + dayMs + startUtcMinutes * 60_000);
  }

  // Overnight window: inactive gap is between endUtcMinutes and startUtcMinutes
  return new Date(dayStart.getTime() + startUtcMinutes * 60_000);
};
