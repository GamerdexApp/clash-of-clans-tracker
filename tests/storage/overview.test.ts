import { describe, expect, it } from "vitest";

import { setTracking } from "@/service/capital";
import { builderLeagueInfo, homeLeagueInfo } from "@/service/leagues";
import {
  builderBaseState,
  builderItemGroups,
  builderProgressCards,
  capitalOverview,
  capitalOverviewState,
  homeItemGroups,
  homeProgressCards,
  homeResources,
  overviewStats,
} from "@/service/overview";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const villageAt = (townHall: number): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.townHallLevel = townHall;
  return village;
};

const NOW = new Date("2026-10-20T09:00:00Z");

describe("Overview", () => {
  it("shows twelve stat tiles and hides the Capital contributions with tracking off", () => {
    const village = villageAt(12);
    expect(overviewStats(village)).toHaveLength(12);
    expect(overviewStats(setTracking(village, false)).map((tile) => tile.id)).not.toContain("contributions");
  });

  it("keeps nine progress cards and locks the ones that cannot apply yet", () => {
    const cards = homeProgressCards(villageAt(12));
    expect(cards).toHaveLength(9);
    expect(cards.find((card) => card.id === "crafted")?.lock).toBe("Town Hall 18");
    expect(cards.find((card) => card.id === "pets")?.lock).toBe("Town Hall 14");
    expect(cards.find((card) => card.id === "structures")?.lock).toBeUndefined();
  });

  it("opens the card once the village can use it", () => {
    expect(homeProgressCards(villageAt(18)).find((card) => card.id === "crafted")?.lock).toBeUndefined();
  });

  it("marks tiles at max, locked and upgrading", () => {
    const village = villageAt(12);
    const hero = village.data.homeVillage.heroes[0];
    const groups = homeItemGroups(village, NOW);
    expect(groups.heroes[0].locked).toBe(true);
    const topped = structuredClone(village);
    topped.data.homeVillage.heroes[0] = {
      ...hero,
      level: groups.heroes[0].maxLevel,
      upgrade: { upgradeStartedAt: NOW.toISOString(), finishesAt: new Date(NOW.getTime() + 3600_000).toISOString(), builderId: 1 },
    };
    const after = homeItemGroups(topped, NOW).heroes[0];
    expect(after.maxed).toBe(true);
    expect(after.upgrading).toBe(true);
    expect(homeItemGroups(topped, new Date(NOW.getTime() + 7200_000)).heroes[0].upgrading).toBe(false);
  });

  it("lists regular troops only, Elixir troops first", () => {
    const names = homeItemGroups(villageAt(12), NOW).troops.map((tile) => tile.name);
    expect(names.length).toBeGreaterThan(0);
    expect(names.indexOf("Barbarian")).toBeLessThan(names.indexOf("Minion") === -1 ? Infinity : names.indexOf("Minion"));
  });

  it("sums production and storage from the built collectors", () => {
    const village = villageAt(12);
    village.data.homeVillage.resourceBuildings = { "gold-mine": [{ level: 5 }], "gold-storage": [{ level: 5 }] };
    const gold = homeResources(village).find((row) => row.id === "gold")!;
    expect(gold.perHour).toBeGreaterThan(0);
    expect(gold.storage).toBeGreaterThan(0);
  });
});

describe("Overview item groups", () => {
  it("lists every troop, hero and pet of the game and locks what the Town Hall cannot use yet", () => {
    const groups = homeItemGroups(villageAt(5), NOW);
    expect(groups.heroes.length).toBeGreaterThanOrEqual(4);
    const lockedHero = groups.heroes.find((hero) => hero.maxLevel === 0);
    expect(lockedHero?.requirement).toMatch(/^Hero Hall/);
    expect(lockedHero?.locked).toBe(true);
    expect(groups.pets.every((pet) => pet.locked && /^Town Hall 1[4-8]$/.test(pet.requirement ?? ""))).toBe(true);
    expect(groups.troops.some((troop) => troop.maxLevel === 0 && troop.requirement?.startsWith("Town Hall"))).toBe(true);
    expect(groups.troops.every((troop) => troop.imageUrl !== "")).toBe(true);
  });

  it("lists the equipment of every hero and locks it without a Blacksmith", () => {
    const groups = homeItemGroups(villageAt(12), NOW);
    const king = groups.heroes.find((hero) => hero.name === "Barbarian King")!;
    expect(king.equipment.length).toBeGreaterThan(0);
    expect(king.equipment.every((piece) => piece.locked && piece.requirement === "Blacksmith")).toBe(true);
  });
});

describe("Overview Builder Base and Clan Capital", () => {
  const withHalls = (townHall: number, builderHall: number, capitalHall: number): Playthrough => {
    const village = villageAt(townHall);
    village.data.builderBase.builderHallLevel = builderHall;
    village.data.clanCapital.capitalPeak.hallLevel = capitalHall;
    return village;
  };

  it("has three Builder Base states", () => {
    expect(builderBaseState(withHalls(5, 0, 0))).toBe("locked");
    expect(builderBaseState(withHalls(8, 0, 0))).toBe("notSet");
    expect(builderBaseState(withHalls(8, 3, 0))).toBe("open");
    expect(builderBaseState(withHalls(3, 2, 0))).toBe("open");
  });

  it("lists every Builder Base troop and hero and locks what the halls cannot use yet", () => {
    const groups = builderItemGroups(withHalls(12, 3, 0), NOW);
    expect(groups.troops.length).toBeGreaterThan(0);
    expect(groups.heroes.some((hero) => hero.maxLevel === 0 && hero.requirement?.startsWith("Builder Hall"))).toBe(true);
    expect(builderProgressCards(withHalls(12, 3, 0))).toHaveLength(5);
  });

  it("separates the Clan Capital states", () => {
    expect(capitalOverviewState(withHalls(2, 0, 0))).toBe("locked");
    expect(capitalOverviewState(setTracking(withHalls(8, 0, 3), false))).toBe("off");
    expect(capitalOverviewState(withHalls(8, 0, 0))).toBe("notSet");
    expect(capitalOverviewState(withHalls(8, 0, 3))).toBe("open");
  });

  it("lists every zone and counts the open districts", () => {
    const village = withHalls(12, 0, 3);
    village.data.clanCapital.barbarianCamp.hallLevel = 1;
    const overview = capitalOverview(village);
    expect(overview.districts).toHaveLength(9);
    expect(overview.cards.find((card) => card.id === "districts")?.result.current).toBe(1);
    expect(overview.districts.find((zone) => zone.id === "skeletonPark")).toMatchObject({ open: false, unlocksAt: 8, needsDistrictHall: false });
    expect(overview.districts.find((zone) => zone.id === "wizardValley")).toMatchObject({ open: false, needsDistrictHall: true });
  });
});

describe("League rewards", () => {
  it("reads the Builder Base league from the saved name", () => {
    const village = villageAt(12);
    village.data.builderBase.builderBaseLeagueName = "Wood League V";
    const info = builderLeagueInfo(village)!;
    expect(info.kind).toBe("builder");
    expect(info.battle.length).toBeGreaterThan(0);
    expect(info.sections[0].lines.map((line) => line.label)).toEqual(["Builder Gold", "Builder Elixir"]);
  });

  it("reads the Home Village league at the Town Hall and says No data when it has no numbers", () => {
    const village = villageAt(12);
    village.data.homeVillage.leagueName = "Legend League";
    const info = homeLeagueInfo(village);
    expect(info).not.toBeNull();
    expect(info!.noData || info!.sections.length > 0).toBe(true);
    village.data.homeVillage.leagueName = "Not A League";
    expect(homeLeagueInfo(village)).toBeNull();
  });
});
