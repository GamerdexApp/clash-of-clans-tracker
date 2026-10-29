import { describe, expect, it } from "vitest";

import { bbBuildingSteps, bbHeroSteps, builderHallSteps, clockTowerMaxLevel, clockTowerSteps } from "@/service/builderBaseSteps";
import { navCounts } from "@/service/navCounts";
import {
  bbBuilderSlots,
  boostedStep,
  completeExpiredUpgrades,
  finishUpgrade,
  laneLabelFor,
  readLevel,
  readUpgrade,
  runningBuilderBase,
  runningUpgrades,
  setLevel,
  startUpgrade,
} from "@/service/upgradeEngine";
import { upgradeSteps } from "@/service/upgradeSteps";
import { targetName } from "@/service/upgradeLabels";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { UpgradeStep } from "@/types/app/upgrade";

import { freshVillage } from "./fixtures";

const NOW = new Date("2026-03-01T12:00:00.000Z");
const HOUR = 3_600_000;
const cannon: UpgradeTarget = { kind: "bbBuilding", record: "defenses", buildingId: "cannon", instanceIndex: 0 };
const machine: UpgradeTarget = { kind: "bbHero", name: "Battle Machine" };
const clock: UpgradeTarget = { kind: "clockTower" };
const hall: UpgradeTarget = { kind: "builderHall" };

const step = (overrides: Partial<UpgradeStep> = {}): UpgradeStep => ({
  level: 2,
  cost: 1000,
  costResource: "Builder Gold",
  buildTime: { days: 0, hours: 10, minutes: 0, seconds: 0 },
  durationMs: 10 * HOUR,
  ...overrides,
});

const villageWith = (build: (village: Playthrough) => void = () => {}): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.builderBase.builderHallLevel = 8;
  village.data.builderBase.defenses = { cannon: [{ level: 5 }, { level: 4 }] };
  build(village);
  return village;
};

describe("Builder Base lane", () => {
  it("always has two builders", () => {
    expect(bbBuilderSlots(villageWith()).slots.map((slot) => slot.label)).toEqual(["Builder 1", "Builder 2"]);
  });

  it("starts a building on a builder and keeps it off the Home Village builders", () => {
    const started = startUpgrade(villageWith(), cannon, step(), 1, { boostPercent: 0, now: NOW });
    expect(readUpgrade(started, cannon)?.builderId).toBe(1);
    expect(bbBuilderSlots(started).slots[0].running?.target).toEqual(cannon);
    expect(runningUpgrades(started)).toEqual([]);
    expect(runningBuilderBase(started)).toHaveLength(1);
  });

  it("raises the level when the upgrade finishes", () => {
    const started = startUpgrade(villageWith(), cannon, step(), 2, { boostPercent: 0, now: NOW });
    const { village } = finishUpgrade(started, cannon, "timePassed", NOW);
    expect(readLevel(village, cannon)).toBe(6);
    expect(readUpgrade(village, cannon)).toBeUndefined();
  });

  it("changes only the one instance", () => {
    const started = startUpgrade(villageWith(), cannon, step(), 1, { boostPercent: 0, now: NOW });
    expect(started.data.builderBase.defenses.cannon[1]).toEqual({ level: 4 });
  });

  it("shows two upgrades sharing a builder number as two", () => {
    const village = startUpgrade(
      startUpgrade(villageWith(), cannon, step(), 1, { boostPercent: 0, now: NOW }),
      machine,
      step(),
      1,
      { boostPercent: 0, now: NOW },
    );
    const { slots, unassigned } = bbBuilderSlots(village);
    expect(slots.filter((slot) => slot.running).length + unassigned.length).toBe(2);
  });

  it("applies no boost to time or cost", () => {
    expect(boostedStep(step(), 20, "bbBuilder")).toEqual({ durationMs: 10 * HOUR, cost: 1000 });
  });

  it("labels the builder", () => {
    expect(laneLabelFor(cannon, 2)).toBe("Builder 2");
  });
});

describe("Builder Base heroes and the Clock Tower", () => {
  it("adds a hero at level 0 when it first changes, in the Builder Base only", () => {
    const village = setLevel(villageWith(), machine, 5, NOW);
    expect(village.data.builderBase.heroes.find((hero) => hero.name === "Battle Machine")?.level).toBe(5);
    expect(village.data.homeVillage.heroes.some((hero) => hero.name === "Battle Machine")).toBe(false);
  });

  it("stores the Clock Tower on the village, not in the Builder Base data", () => {
    const started = startUpgrade(setLevel(villageWith(), clock, 7, NOW), clock, step(), 1, { boostPercent: 0, now: NOW });
    expect(started.bbExtras?.clockTower?.level).toBe(7);
    expect(started.bbExtras?.clockTower?.upgrade?.builderId).toBe(1);
    const { village } = finishUpgrade(started, clock, "timePassed", NOW);
    expect(village.bbExtras?.clockTower).toEqual({ level: 8 });
  });

  it("completes expired Builder Base upgrades with the others in one pass", () => {
    const village = startUpgrade(villageWith(), cannon, step({ durationMs: HOUR }), 1, { boostPercent: 0, now: NOW });
    const result = completeExpiredUpgrades(village, new Date(NOW.getTime() + 2 * HOUR));
    expect(result.completed.map((entry) => [entry.target.kind, entry.fromLevel, entry.toLevel])).toEqual([["bbBuilding", 5, 6]]);
  });

  it("counts running Builder Base upgrades in the sidebar", () => {
    const started = startUpgrade(villageWith(), cannon, step(), 1, { boostPercent: 0, now: NOW });
    expect(navCounts(started).builderBaseUpgrades).toBe(1);
  });
});

describe("steps", () => {
  it("lists levels above the current one that this Builder Hall allows, with Builder Gold or Elixir", () => {
    const steps = bbBuildingSteps("defenses", "cannon", 5, 8);
    expect(steps[0].level).toBe(6);
    expect(steps.every((candidate) => candidate.costResource.startsWith("Builder"))).toBe(true);
  });

  it("stops at the Builder Hall cap", () => {
    const low = bbBuildingSteps("defenses", "cannon", 0, 3);
    const high = bbBuildingSteps("defenses", "cannon", 0, 9);
    expect(high.length).toBeGreaterThan(low.length);
  });

  it("reads hero and Clock Tower steps through the engine", () => {
    const village = villageWith();
    expect(upgradeSteps(village, machine).length).toBe(bbHeroSteps("Battle Machine", 0, 8).length);
    expect(upgradeSteps(village, clock).length).toBe(clockTowerSteps(0, 8).length);
    expect(clockTowerMaxLevel(8)).toBeGreaterThan(0);
  });

  it("names a building with its instance number", () => {
    expect(targetName(cannon)).toBe("Cannon #1");
    expect(targetName(clock)).toBe("Clock Tower");
  });
});

describe("Builder Hall tile", () => {
  it("offers only the next level as a step", () => {
    const steps = builderHallSteps(8);
    expect(steps).toHaveLength(1);
    expect(steps[0].level).toBe(9);
    expect(upgradeSteps(villageWith(), hall)).toHaveLength(1);
  });

  it("starts on a builder and keeps the timer outside the Builder Base data", () => {
    const started = startUpgrade(villageWith(), hall, step({ level: 9 }), 1, { boostPercent: 0, now: NOW });
    expect(started.bbExtras?.builderHallUpgrade?.builderId).toBe(1);
    expect(started.data.builderBase.builderHallLevel).toBe(8);
    expect(bbBuilderSlots(started).slots[0].running?.target).toEqual(hall);
  });

  it("raises the level, clears the timer and stamps the day when it finishes", () => {
    const started = startUpgrade(villageWith(), hall, step({ level: 9 }), 1, { boostPercent: 0, now: NOW });
    const { village } = finishUpgrade(started, hall, "timePassed", NOW);
    expect(village.data.builderBase.builderHallLevel).toBe(9);
    expect(village.bbExtras?.builderHallUpgrade).toBeUndefined();
    expect(village.bhChangedAt).toBe("2026-03-01T00:00:00.000Z");
  });

  it("keeps the Clock Tower when the Builder Hall timer changes", () => {
    const withClock = setLevel(villageWith(), clock, 6, NOW);
    const started = startUpgrade(withClock, hall, step({ level: 9 }), 1, { boostPercent: 0, now: NOW });
    expect(started.bbExtras?.clockTower?.level).toBe(6);
  });

  it("sets the level by hand, never above 10", () => {
    expect(setLevel(villageWith(), hall, 4, NOW).data.builderBase.builderHallLevel).toBe(4);
    expect(setLevel(villageWith(), hall, 99, NOW).data.builderBase.builderHallLevel).toBe(10);
  });
});

describe("Clock Tower picture", () => {
  it("has a picture for every level, and level 1 for an unbuilt tower", async () => {
    const { clockTowerImageUrl } = await import("@/service/builderBaseSteps");
    expect(clockTowerImageUrl(8)).toContain("clock-tower/normal/level-8.png");
    expect(clockTowerImageUrl(0)).toContain("clock-tower/normal/level-1.png");
  });
});
