import { describe, expect, it } from "vitest";

import { availableUpgrades, queueItemFor, stepsUpTo } from "@/service/availableUpgrades";
import { getBuildingUpgradeSteps } from "@/lib/utils/upgradeHelpers";
import { addToQueue, targetForItem } from "@/service/builderQueue";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const NOW = Date.now();

const villageWith = (townHall: number, build: (village: Playthrough) => void = () => {}): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.townHallLevel = townHall;
  village.data.homeVillage.defenses = { "builders-hut": [{ level: 1 }], cannon: [{ level: 10 }] };
  build(village);
  return village;
};

const cannonGroup = (village: Playthrough) =>
  availableUpgrades(village).find((group) => group.key === "cannon:0" && group.category === "defenses");

describe("availableUpgrades", () => {
  it("lists the steps after the current level, lowest first", () => {
    const steps = cannonGroup(villageWith(12))!.steps;
    expect(steps[0].level).toBe(11);
    expect(steps.map((step) => step.level)).toEqual([...steps.map((step) => step.level)].sort((a, b) => a - b));
  });

  it("starts after the running upgrade", () => {
    const village = villageWith(12, (v) => {
      v.data.homeVillage.defenses.cannon[0].upgrade = { upgradeStartedAt: "a", finishesAt: new Date(NOW + 3_600_000).toISOString(), builderId: 1 };
    });
    expect(cannonGroup(village)!.steps[0].level).toBe(12);
  });

  it("leaves out levels that are already queued", () => {
    const group = cannonGroup(villageWith(12))!;
    const queued = addToQueue(villageWith(12), 1, queueItemFor(group, group.steps[0], "q1"));
    expect(cannonGroup(queued)!.steps[0].level).toBe(12);
  });

  it("offers a Town Hall step and every hero at this Town Hall", () => {
    const groups = availableUpgrades(villageWith(12));
    expect(groups.find((group) => group.category === "townHall")?.name).toBe("Town Hall 13");
    expect(groups.filter((group) => group.category === "heroes").length).toBeGreaterThan(0);
  });

  it("keeps guardians and crafted defenses out below Town Hall 18", () => {
    const categories = new Set(availableUpgrades(villageWith(12)).map((group) => group.category));
    expect(categories.has("guardians")).toBe(false);
    expect(categories.has("craftedDefenses")).toBe(false);
  });

  it("puts supercharge steps in their own group", () => {
    const ids = ["cannon", "archer-tower", "mortar", "air-defense", "wizard-tower", "hidden-tesla", "bomb-tower", "x-bow", "inferno-tower", "eagle-artillery"];
    const found = ids
      .flatMap((buildingId) => Array.from({ length: 30 }, (_, level) => ({ buildingId, level })))
      .find(({ buildingId, level }) => getBuildingUpgradeSteps(buildingId, level, 18, 0, 0)[0]?.isSupercharge);
    expect(found).toBeDefined();

    const village = villageWith(18, (v) => {
      v.data.homeVillage.defenses[found!.buildingId] = [{ level: found!.level }];
    });
    const groups = availableUpgrades(village).filter((group) => group.key.startsWith(`${found!.buildingId}:0`));
    expect(groups.some((group) => group.category === "supercharges" && group.steps.every((step) => step.isSupercharge))).toBe(true);
  });
});

describe("queueItemFor", () => {
  it("stores the raw duration and the shape the old app wrote", () => {
    const group = cannonGroup(villageWith(12))!;
    const step = group.steps[0];
    const item = queueItemFor(group, step, "id-1");
    expect(item).toMatchObject({ id: "id-1", name: "Cannon", category: "defenses", buildingId: "cannon", instanceIndex: 0, targetLevel: 11, durationMs: step.durationMs, cost: step.cost });
    expect(targetForItem(item)).toEqual({ kind: "building", record: "defenses", buildingId: "cannon", instanceIndex: 0 });
  });

  it("stores a hero by id and reads it back by name", () => {
    const group = availableUpgrades(villageWith(12)).find((candidate) => candidate.name === "Archer Queen")!;
    const item = queueItemFor(group, group.steps[0], "h");
    expect(item).toMatchObject({ category: "heroes", buildingId: "archer-queen", name: "Archer Queen" });
    expect(targetForItem(item)).toEqual({ kind: "hero", name: "Archer Queen" });
  });
});

describe("stepsUpTo", () => {
  it("returns every missing level up to the chosen one", () => {
    const group = cannonGroup(villageWith(12))!;
    expect(stepsUpTo(group, 13).map((step) => step.level)).toEqual([11, 12, 13]);
  });
});
