import { builder } from "clash-of-clans-data";

import type { Playthrough } from "@/types/app";

interface RawLeague {
  name: string;
  group: string;
  trophyMin: number;
  trophyMax: number | null;
}

export interface BuilderLeague {
  /** The text the app saves, for example "Steel League II". */
  storedName: string;
  /** The name the package uses, for example "Steel II". */
  name: string;
  trophyMin: number;
  trophyMax: number | null;
}

const leagues: BuilderLeague[] = (builder().leagues().get() as unknown as RawLeague[]).map((league) => ({
  storedName: league.name.replace(league.group, `${league.group} League`),
  name: league.name,
  trophyMin: league.trophyMin,
  trophyMax: league.trophyMax,
}));

/** Every Builder Base league, lowest first. */
export const builderLeagues = (): BuilderLeague[] => leagues;

/** The league a trophy count falls in. The top league has no upper limit. */
export const leagueForTrophies = (trophies: number): BuilderLeague =>
  leagues.find((league) => trophies >= league.trophyMin && (league.trophyMax === null || trophies <= league.trophyMax)) ??
  leagues[0];

const withBuilderBase = (village: Playthrough, change: Partial<Playthrough["data"]["builderBase"]>): Playthrough => ({
  ...village,
  data: { ...village.data, builderBase: { ...village.data.builderBase, ...change } },
});

const wholeNumber = (value: number) => Math.max(0, Math.floor(value));

/** Trophies above the best raise the best to match. */
export const setTrophies = (village: Playthrough, value: number): Playthrough => {
  const trophies = wholeNumber(value);
  return withBuilderBase(village, {
    builderBaseTrophies: trophies,
    bestBuilderBaseTrophies: Math.max(village.data.builderBase.bestBuilderBaseTrophies, trophies),
  });
};

/** A best below the trophies is refused: it becomes the trophies. */
export const setBestTrophies = (village: Playthrough, value: number): Playthrough =>
  withBuilderBase(village, {
    bestBuilderBaseTrophies: Math.max(village.data.builderBase.builderBaseTrophies, wholeNumber(value)),
  });

export const setLeague = (village: Playthrough, storedName: string): Playthrough =>
  withBuilderBase(village, { builderBaseLeagueName: storedName });

export const matchLeagueToTrophies = (village: Playthrough): Playthrough =>
  setLeague(village, leagueForTrophies(village.data.builderBase.builderBaseTrophies).storedName);

/** The "since" date is saved as UTC midnight of that day. An empty date clears it. */
export const setBuilderHallSince = (village: Playthrough, date: string | null): Playthrough => {
  const { bhChangedAt: _previous, ...rest } = village;
  return date ? { ...rest, bhChangedAt: new Date(`${date}T00:00:00.000Z`).toISOString() } : rest;
};
