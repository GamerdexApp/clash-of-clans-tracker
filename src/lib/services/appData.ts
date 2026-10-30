import type { AppData, AppSettings, Playthrough } from "@/types/app";

import { defaultSettings } from "./migrate";

export type NewPlaythrough = Omit<Playthrough, "id" | "createdAt" | "lastModified">;

interface AddOptions {
  makeActive?: boolean;
  now?: Date;
  id?: string;
}

export const addPlaythrough = (
  current: AppData,
  input: NewPlaythrough,
  { makeActive = false, now = new Date(), id = crypto.randomUUID() }: AddOptions = {},
): AppData => {
  const timestamp = now.toISOString();
  const created: Playthrough = { ...input, id, createdAt: timestamp, lastModified: timestamp };
  return {
    ...current,
    playthroughs: [...current.playthroughs, created],
    activePlaythroughId:
      makeActive || current.playthroughs.length === 0 ? created.id : current.activePlaythroughId,
  };
};

export const updatePlaythrough = (
  current: AppData,
  id: string,
  updates: Partial<Playthrough>,
  now = new Date(),
): AppData => ({
  ...current,
  playthroughs: current.playthroughs.map((playthrough) =>
    playthrough.id === id
      ? { ...playthrough, ...updates, lastModified: now.toISOString() }
      : playthrough,
  ),
});

const mostRecentlyModified = (playthroughs: Playthrough[]) =>
  playthroughs.reduce<Playthrough | null>(
    (latest, playthrough) =>
      latest === null || playthrough.lastModified > latest.lastModified ? playthrough : latest,
    null,
  );

export const deletePlaythrough = (current: AppData, id: string): AppData => {
  const playthroughs = current.playthroughs.filter((playthrough) => playthrough.id !== id);
  return {
    ...current,
    playthroughs,
    activePlaythroughId:
      current.activePlaythroughId === id
        ? (mostRecentlyModified(playthroughs)?.id ?? null)
        : current.activePlaythroughId,
  };
};

export const setActivePlaythrough = (current: AppData, id: string | null): AppData => ({
  ...current,
  activePlaythroughId: id,
});

export const updateSettings = (current: AppData, patch: Partial<AppSettings>): AppData => ({
  ...current,
  settings: { ...(current.settings ?? defaultSettings), ...patch },
});
