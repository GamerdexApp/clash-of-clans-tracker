export { formatDate, formatDateTime, formatFinishTime, formatNumber, formatShortDate } from "@/i18n/formatter";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** "1d 14h 20m" for a long span, "8h 48m" for a day or less, and "0m" for no time. */
export const formatDuration = (ms: number): string => {
  const total = Math.max(0, Math.round(ms / MINUTE_MS));
  const days = Math.floor(total / (24 * 60));
  const hours = Math.floor((total % (24 * 60)) / 60);
  const minutes = total % 60;
  const parts = [days > 0 && `${days}d`, hours > 0 && `${hours}h`, (minutes > 0 || total === 0) && `${minutes}m`];
  return parts.filter(Boolean).join(" ");
};

/** A running countdown: days and hours for a long wait, seconds for the last minutes. */
export const formatCountdown = (ms: number): string => {
  const left = Math.max(0, ms);
  const days = Math.floor(left / DAY_MS);
  const hours = Math.floor((left % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((left % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((left % MINUTE_MS) / SECOND_MS);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
};

/** A daily timer countdown: "03:12:48". */
export const formatClock = (ms: number): string => {
  const left = Math.max(0, Math.ceil(ms / SECOND_MS));
  const hours = Math.floor(left / 3600);
  const minutes = Math.floor((left % 3600) / 60);
  return [hours, minutes, left % 60].map((part) => String(part).padStart(2, "0")).join(":");
};

/** Time left on a run: "1d 4h 12m" for a day or more, "15h 42m 08s" below a day. */
export const formatTimeLeft = (ms: number): string => {
  const left = Math.max(0, Math.floor(ms / SECOND_MS));
  const days = Math.floor(left / 86_400);
  const hours = Math.floor((left % 86_400) / 3600);
  const minutes = Math.floor((left % 3600) / 60);
  const seconds = String(left % 60).padStart(2, "0");
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
};
