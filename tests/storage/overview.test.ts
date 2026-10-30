import { describe, expect, it } from "vitest";

import { setTracking } from "@/service/capital";
import { homeItemGroups, homeProgressCards, homeResources, overviewStats } from "@/service/overview";
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
