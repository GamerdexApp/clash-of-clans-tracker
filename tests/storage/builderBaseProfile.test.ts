import { describe, expect, it } from "vitest";

import {
  builderLeagues,
  leagueForTrophies,
  matchLeagueToTrophies,
  setBestTrophies,
  setBuilderHallSince,
  setLeague,
  setTrophies,
} from "@/service/builderBaseProfile";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const villageWith = (trophies: number, best: number): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.builderBase.builderBaseTrophies = trophies;
  village.data.builderBase.bestBuilderBaseTrophies = best;
  return village;
};

describe("leagues", () => {
  it("lists all 42 leagues in the form the app saves", () => {
    const leagues = builderLeagues();
    expect(leagues).toHaveLength(42);
    expect(leagues.find((league) => league.name === "Steel II")?.storedName).toBe("Steel League II");
    expect(leagues.at(-1)?.storedName).toBe("Diamond League");
  });

  it("finds the league for a trophy count, with no upper limit at the top", () => {
    expect(leagueForTrophies(0).name).toBe("Wood V");
    expect(leagueForTrophies(3500).name).toBe("Steel II");
    expect(leagueForTrophies(6200).name).toBe("Diamond");
    expect(leagueForTrophies(9999).name).toBe("Diamond");
  });

  it("matches the league to the trophies", () => {
    expect(matchLeagueToTrophies(villageWith(3500, 3500)).data.builderBase.builderBaseLeagueName).toBe("Steel League II");
  });

  it("saves a chosen league", () => {
    expect(setLeague(villageWith(0, 0), "Ruby League I").data.builderBase.builderBaseLeagueName).toBe("Ruby League I");
  });
});

describe("trophies", () => {
  it("raises the best when the trophies pass it", () => {
    const next = setTrophies(villageWith(3000, 3200), 3500).data.builderBase;
    expect([next.builderBaseTrophies, next.bestBuilderBaseTrophies]).toEqual([3500, 3500]);
  });

  it("keeps the best when the trophies fall", () => {
    const next = setTrophies(villageWith(3500, 3500), 3000).data.builderBase;
    expect([next.builderBaseTrophies, next.bestBuilderBaseTrophies]).toEqual([3000, 3500]);
  });

  it("refuses a best below the trophies and uses the trophies", () => {
    expect(setBestTrophies(villageWith(3000, 3200), 100).data.builderBase.bestBuilderBaseTrophies).toBe(3000);
    expect(setBestTrophies(villageWith(3000, 3200), 4000).data.builderBase.bestBuilderBaseTrophies).toBe(4000);
  });

  it("allows 0 and whole numbers only", () => {
    expect(setTrophies(villageWith(5, 5), 0).data.builderBase.builderBaseTrophies).toBe(0);
    expect(setTrophies(villageWith(5, 5), 12.9).data.builderBase.builderBaseTrophies).toBe(12);
    expect(setTrophies(villageWith(5, 5), -4).data.builderBase.builderBaseTrophies).toBe(0);
  });
});

describe("days at Builder Hall", () => {
  it("saves the day as UTC midnight and clears it for an empty date", () => {
    const set = setBuilderHallSince(villageWith(0, 0), "2026-09-28");
    expect(set.bhChangedAt).toBe("2026-09-28T00:00:00.000Z");
    expect("bhChangedAt" in setBuilderHallSince(set, null)).toBe(false);
  });
});
