import { describe, expect, it } from "vitest";

import { getPetUpgradeSteps, getResearchUpgradeSteps } from "@/lib/utils/upgradeHelpers";
import {
  boostedStep,
  completeExpiredUpgrades,
  finishUpgrade,
  laneLabelFor,
  petSlots,
  readLevel,
  readUpgrade,
  requirementBlock,
  researchSlots,
  runningUpgrades,
  setLevel,
  startUpgrade,
} from "@/service/upgradeEngine";
import { upgradeSteps } from "@/service/upgradeSteps";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { UpgradeStep } from "@/types/app/upgrade";

import { freshVillage } from "./fixtures";

const NOW = new Date("2026-03-01T12:00:00.000Z");
const HOUR = 3_600_000;
const archers: UpgradeTarget = { kind: "research", record: "troops", name: "Archer" };
const unicorn: UpgradeTarget = { kind: "pet", name: "L.A.S.S.I" };

const step = (overrides: Partial<UpgradeStep> = {}): UpgradeStep => ({
  level: 2,
  cost: 1000,
  costResource: "Elixir",
  buildTime: { days: 0, hours: 10, minutes: 0, seconds: 0 },
  durationMs: 10 * HOUR,
  ...overrides,
});

const villageWith = (build: (village: Playthrough) => void = () => {}): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.townHallLevel = 14;
  build(village);
  return village;
};

describe("research lanes", () => {
  it("has the Laboratory, and the Goblin Researcher only when its setting is on", () => {
    const village = villageWith();
    expect(researchSlots(village, false).slots.map((slot) => slot.label)).toEqual(["Laboratory"]);
    expect(researchSlots(village, true).slots.map((slot) => slot.label)).toEqual(["Laboratory", "Goblin Researcher"]);
  });

  it("starts research on the Laboratory without using a builder", () => {
    const started = startUpgrade(villageWith(), archers, step(), 1, { boostPercent: 0, now: NOW });
    expect(readUpgrade(started, archers)?.builderId).toBe(1);
    expect(researchSlots(started, false).slots[0].running?.target).toEqual(archers);
    expect(runningUpgrades(started)).toEqual([]);
  });

  it("adds an untracked item at level 0 and raises it when the research finishes", () => {
    const started = startUpgrade(villageWith(), archers, step(), 1, { boostPercent: 0, now: NOW });
    const { village } = finishUpgrade(started, archers, "timePassed", NOW);
    expect(readLevel(village, archers)).toBe(1);
    expect(readUpgrade(village, archers)).toBeUndefined();
  });

  it("stores the boosted time", () => {
    const started = startUpgrade(villageWith(), archers, step(), 1, { boostPercent: 20, now: NOW });
    expect(Date.parse(readUpgrade(started, archers)!.finishesAt) - NOW.getTime()).toBe(8 * HOUR);
  });

  it("boosts research cost, and never a gem cost", () => {
    expect(boostedStep(step(), 20, "research").cost).toBe(800);
    expect(boostedStep(step({ costResource: "Gems" }), 20, "research").cost).toBe(1000);
  });

  it("labels the lane the research runs on", () => {
    expect(laneLabelFor(archers, 1)).toBe("Laboratory");
    expect(laneLabelFor(archers, 7)).toBe("Goblin Researcher");
    expect(laneLabelFor(unicorn, 1)).toBe("Pet House");
  });

  it("completes expired research and pets with the builder upgrades in one pass", () => {
    const village = startUpgrade(
      startUpgrade(villageWith(), archers, step({ durationMs: HOUR }), 1, { boostPercent: 0, now: NOW }),
      unicorn,
      step({ durationMs: 2 * HOUR }),
      1,
      { boostPercent: 0, now: NOW },
    );
    const later = new Date(NOW.getTime() + 3 * HOUR);
    const result = completeExpiredUpgrades(village, later);
    expect(result.completed.map((entry) => [entry.target.kind, entry.fromLevel, entry.toLevel])).toEqual([
      ["research", 0, 1],
      ["pet", 0, 1],
    ]);
    expect(readUpgrade(result.village, archers)).toBeUndefined();
  });

  it("sets a level by hand and appends the missing entry", () => {
    const village = setLevel(villageWith(), archers, 5, NOW);
    expect(village.data.homeVillage.troops.find((item) => item.name === "Archer")?.level).toBe(5);
  });
});

describe("pet house lane", () => {
  it("is one lane that a running pet fills", () => {
    const started = startUpgrade(villageWith(), unicorn, step({ costResource: "Dark Elixir" }), 1, {
      boostPercent: 0,
      now: NOW,
    });
    const { slots } = petSlots(started);
    expect(slots).toHaveLength(1);
    expect(slots[0].running?.target).toEqual(unicorn);
  });
});

describe("requirements", () => {
  it("names the Laboratory level a research step needs", () => {
    const withRequirement = getResearchUpgradeSteps("Archer", 0, 14).find((candidate) => candidate.requires);
    expect(withRequirement?.requires?.building).toBe("laboratory");
  });

  it("blocks a step when the tracked Laboratory is too low", () => {
    const village = villageWith((v) => {
      v.data.homeVillage.armyBuildings.laboratory = [{ level: 1 }];
    });
    const blocked = requirementBlock(village, step({ requires: { building: "laboratory", level: 5 } }));
    expect(blocked).toEqual({ building: "laboratory", level: 5, builtLevel: 1 });
    expect(requirementBlock(village, step({ requires: { building: "laboratory", level: 1 } }))).toBeNull();
  });

  it("does not block research when no Laboratory is tracked", () => {
    expect(requirementBlock(villageWith(), step({ requires: { building: "laboratory", level: 5 } }))).toBeNull();
  });

  it("always needs a built Pet House", () => {
    const blocked = requirementBlock(villageWith(), step({ requires: { building: "pet-house", level: 1 } }));
    expect(blocked?.builtLevel).toBe(0);
  });

  it("reads pet steps from the package with the Pet House level they need", () => {
    const steps = getPetUpgradeSteps("L.A.S.S.I", 1);
    expect(steps.every((candidate) => candidate.requires?.building === "pet-house")).toBe(true);
    expect(upgradeSteps(villageWith(), unicorn)[0]?.level).toBe(steps[0]?.level);
  });
});
