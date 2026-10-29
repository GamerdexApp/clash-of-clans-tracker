import { describe, expect, it } from "vitest";

import { migratePlaythrough } from "@/service/migrate";
import { builderSlots, readUpgrade, runningUpgrades } from "@/service/upgradeEngine";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const timer = (builderId: number, startedAt: string) => ({
  upgradeStartedAt: startedAt,
  finishesAt: "2099-03-01T00:00:00.000Z",
  builderId,
});

const villageWithHuts = (huts: number, build: (village: Playthrough) => void): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.defenses = {
    "builders-hut": Array.from({ length: huts }, () => ({ level: 1 })),
    cannon: [{ level: 1 }],
  };
  build(village);
  return village;
};

const trapAndHeroOnBuilderOne = (huts: number) =>
  villageWithHuts(huts, (village) => {
    const hv = village.data.homeVillage;
    hv.traps = { bomb: [{ level: 1, upgrade: timer(1, "2026-03-01T00:00:00.000Z") }] };
    hv.heroes = [{ name: "Barbarian King", level: 5, equipment: [], upgrade: timer(1, "2026-03-01T02:00:00.000Z") }];
  });

describe("two upgrades saved on one builder", () => {
  it("shows both when read as saved, the second as unassigned", () => {
    const { slots, unassigned } = builderSlots(trapAndHeroOnBuilderOne(2), false);
    expect(slots.filter((slot) => slot.running)).toHaveLength(1);
    expect(unassigned).toHaveLength(1);
  });

  it("puts the one that started later on a free builder when the data loads", () => {
    const loaded = migratePlaythrough(trapAndHeroOnBuilderOne(2));
    const { slots, unassigned } = builderSlots(loaded, false);
    expect(unassigned).toEqual([]);
    expect(slots.map((slot) => slot.running?.target.kind)).toEqual(["building", "hero"]);
    expect(readUpgrade(loaded, { kind: "hero", name: "Barbarian King" })?.finishesAt).toBe("2099-03-01T00:00:00.000Z");
  });

  it("leaves it unassigned when every builder is busy", () => {
    const loaded = migratePlaythrough(trapAndHeroOnBuilderOne(1));
    expect(runningUpgrades(loaded)).toHaveLength(2);
    expect(builderSlots(loaded, false).unassigned).toHaveLength(1);
  });

  it("changes nothing when each upgrade has its own builder", () => {
    const village = villageWithHuts(2, (v) => {
      v.data.homeVillage.traps = { bomb: [{ level: 1, upgrade: timer(1, "2026-03-01T00:00:00.000Z") }] };
      v.data.homeVillage.heroes = [{ name: "Barbarian King", level: 5, equipment: [], upgrade: timer(2, "2026-03-01T00:00:00.000Z") }];
    });
    expect(migratePlaythrough(village).data.homeVillage).toEqual(migratePlaythrough(migratePlaythrough(village)).data.homeVillage);
    expect(readUpgrade(migratePlaythrough(village), { kind: "hero", name: "Barbarian King" })?.builderId).toBe(2);
  });
});
