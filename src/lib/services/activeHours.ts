import { localTimeToUtcMinutes } from "@/lib/utils/activeHoursHelpers";
import type { ActiveHours, ActiveHoursLocal } from "@/types/app/playthrough";

export type ActiveHoursProblem = "sameTime" | "overnight" | null;

export const activeHoursProblem = ({ start, end }: ActiveHoursLocal): ActiveHoursProblem => {
  if (start === end) return "sameTime";
  return end < start ? "overnight" : null;
};

export const utcWindowFor = ({ start, end }: ActiveHoursLocal): ActiveHours => ({
  startUtcMinutes: localTimeToUtcMinutes(start),
  endUtcMinutes: localTimeToUtcMinutes(end),
});

export const isSameWindow = (a: ActiveHours | undefined, b: ActiveHours) =>
  a?.startUtcMinutes === b.startUtcMinutes && a?.endUtcMinutes === b.endUtcMinutes;

/** "07:00" as the clock shows it in the player's locale. */
export const formatClockTime = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(
    new Date(2000, 0, 1, hours, minutes),
  );
};
