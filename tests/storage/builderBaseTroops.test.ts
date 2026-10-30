import { describe, expect, it } from "vitest";

import { bbTroopCatalog, bbTroopSteps } from "@/service/builderBaseSteps";
import { navCounts } from "@/service/navCounts";
import {
  bbBuilderSlots,
  bbResearchSlots,
  boostedStep,
  completeExpiredUpgrades,
  finishUpgrade,
  laneLabelFor,
  readLevel,
  readUpgrade,
  requirementBlock,
  runningBuilderBase,
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
const cart: UpgradeTarget = { kind: "bbTroop", name: "Cannon Cart" };

const step = (overrides: Partial<UpgradeStep> = {}): UpgradeStep => ({
  level: 15,
  cost: 3_400_000,
  costResource: "Builder Elixir",
  buildTime: { days: 0, hours: 10, minutes: 0, seconds: 0 },
  durationMs: 10 * HOUR,
  ...overrides,
});

const villageWith = (build: (village: Playthrough) => void = () => {}): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.builderBase.builderHallLevel = 8;
  village.data.builderBase.armyBuildings = { "star-laboratory": [{ level: 8 }] };
  build(village);
  return village;
};

describe("Star Laboratory lane", () => {
  it("is one lane that a running troop research fills, apart from the builders", () => {
    const started = startUpgrade(villageWith(), cart, step(), 1, { boostPercent: 0, now: NOW });
    expect(readUpgrade(started, cart)?.builderId).toBe(1);
    const { slots } = bbResearchSlots(started);
    expect(slots).toHaveLength(1);
    expect(slots[0].running?.target).toEqual(cart);
    expect(runningBuilderBase(started)).toEqual([]);
    expect(runningUpgrades(started)).toEqual([]);
    expect(bbBuilderSlots(started).slots.every((slot) => slot.running === null)).toBe(true);
  });

  it("raises the troop and clears the timer when it finishes", () => {
    const started = startUpgrade(setLevel(villageWith(), cart, 14, NOW), cart, step(), 1, { boostPercent: 0, now: NOW });
    const { village } = finishUpgrade(started, cart, "timePassed", NOW);
    expect(readLevel(village, cart)).toBe(15);
    expect(readUpgrade(village, cart)).toBeUndefined();
  });

  it("completes expired troop research with the other upgrades in one pass", () => {
    const started = startUpgrade(villageWith(), cart, step({ durationMs: HOUR }), 1, { boostPercent: 0, now: NOW });
    const result = completeExpiredUpgrades(started, new Date(NOW.getTime() + 2 * HOUR));
    expect(result.completed.map((entry) => [entry.target.kind, entry.toLevel])).toEqual([["bbTroop", 1]]);
  });

  it("has no boost and its own label", () => {
    expect(boostedStep(step(), 20, "bbResearch")).toEqual({ durationMs: 10 * HOUR, cost: 3_400_000 });
    expect(laneLabelFor(cart, 1)).toBe("Star Laboratory");
  });

  it("counts running research in the sidebar", () => {
    const started = startUpgrade(villageWith(), cart, step(), 1, { boostPercent: 0, now: NOW });
    expect(navCounts(started).builderBaseTroops).toBe(1);
  });
});

describe("troop catalog", () => {
  it("caps most troops at level 16 at Builder Hall 8 and starts some above level 1", () => {
    const troops = bbTroopCatalog(8);
    expect(troops.find((troop) => troop.name === "Baby Dragon")).toMatchObject({ firstLevel: 5, maxLevel: 16 });
    expect(troops.find((troop) => troop.name === "Cannon Cart")?.firstLevel).toBe(7);
  });

  it("lists the Hog Glider and Electrofire Wizard as not available at Builder Hall 8, with what they need", () => {
    const troops = bbTroopCatalog(8);
    expect(troops.find((troop) => troop.name === "Hog Glider")).toMatchObject({ maxLevel: 0, barracksRequired: 11, builderHallRequired: 9 });
    expect(troops.find((troop) => troop.name === "Electrofire Wizard")).toMatchObject({ maxLevel: 0, builderHallRequired: 10 });
    expect(bbTroopCatalog(9).find((troop) => troop.name === "Hog Glider")?.maxLevel).toBeGreaterThan(0);
  });
});

describe("steps", () => {
  it("starts a troop at its free first level", () => {
    const first = upgradeSteps(villageWith(), { kind: "bbTroop", name: "Baby Dragon" })[0];
    expect(first).toMatchObject({ level: 5, cost: 0, durationMs: 0 });
  });

  it("stops at the Star Laboratory cap for the Builder Hall", () => {
    const steps = bbTroopSteps("Cannon Cart", 7, 8);
    expect(steps.at(-1)?.level).toBe(16);
    expect(bbTroopSteps("Cannon Cart", 7, 10).at(-1)?.level).toBe(20);
  });

  it("names the Star Laboratory level a step needs and blocks when it is too low", () => {
    const step8 = bbTroopSteps("Cannon Cart", 7, 8).find((candidate) => candidate.level === 15)!;
    expect(step8.requires).toEqual({ building: "star-laboratory", level: 8 });
    const low = villageWith((v) => (v.data.builderBase.armyBuildings = { "star-laboratory": [{ level: 5 }] }));
    expect(requirementBlock(low, step8)).toEqual({ building: "star-laboratory", level: 8, builtLevel: 5 });
    expect(requirementBlock(villageWith(), step8)).toBeNull();
  });

  it("does not block when no Star Laboratory level is saved", () => {
    const none = villageWith((v) => (v.data.builderBase.armyBuildings = {}));
    const step8 = bbTroopSteps("Cannon Cart", 7, 8).find((candidate) => candidate.level === 15)!;
    expect(requirementBlock(none, step8)).toBeNull();
  });
});
