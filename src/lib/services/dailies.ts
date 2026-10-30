import { defaultDailies } from "./defaultDailies";
import type { Playthrough } from "@/types/app";
import type { DailiesData, DailyTimerData } from "@/types/app/playthrough";

export type TimerKey = "capitalGold" | "starBonus" | "prospector" | "alchemist" | "buildersApprentice" | "labAssistant";

/** A timer has no reset time yet, can be used now, or counts down to the next reset. */
export type TimerState = "notSet" | "available" | "counting";

export const dailiesOf = (village: Playthrough): DailiesData => village.dailies ?? defaultDailies;

export const withDailies = (village: Playthrough, dailies: DailiesData): Playthrough => ({ ...village, dailies });

export const readTimer = (dailies: DailiesData, key: TimerKey): DailyTimerData =>
  key === "capitalGold" || key === "starBonus" ? dailies[key] : dailies.helpers[key];

const writeTimer = (dailies: DailiesData, key: TimerKey, timer: DailyTimerData): DailiesData =>
  key === "capitalGold" || key === "starBonus"
    ? { ...dailies, [key]: timer }
    : { ...dailies, helpers: { ...dailies.helpers, [key]: timer } };

const resetAt = (resetTime: string, day: Date): Date => {
  const [hours, minutes] = resetTime.split(":").map(Number);
  const at = new Date(day);
  at.setHours(hours, minutes, 0, 0);
  return at;
};

export const latestReset = (resetTime: string, now: Date): Date => {
  const today = resetAt(resetTime, now);
  if (today <= now) return today;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
};

export const nextReset = (resetTime: string, now: Date): Date => {
  const today = resetAt(resetTime, now);
  if (today > now) return today;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export const timerState = (timer: DailyTimerData, now: Date): TimerState => {
  if (!timer.resetTime) return "notSet";
  const neverUsed = !timer.lastCollectedAt;
  return neverUsed || Date.parse(timer.lastCollectedAt!) < latestReset(timer.resetTime, now).getTime()
    ? "available"
    : "counting";
};

export const setResetTime = (dailies: DailiesData, key: TimerKey, resetTime: string): DailiesData =>
  writeTimer(dailies, key, { ...readTimer(dailies, key), resetTime });

export const markUsed = (dailies: DailiesData, key: TimerKey, now: Date): DailiesData =>
  writeTimer(dailies, key, { ...readTimer(dailies, key), lastCollectedAt: now.toISOString() });

export const setResetTimeAndMarkUsed = (dailies: DailiesData, key: TimerKey, resetTime: string, now: Date): DailiesData =>
  markUsed(setResetTime(dailies, key, resetTime), key, now);
