import { describe, expect, it } from "vitest";

import { availableFor, queueItemForGroup } from "@/service/queueAvailability";
import { boostForLane } from "@/service/goldPass";
import { readLevel, readUpgrade } from "@/service/upgradeEngine";
import {
  addToQueue,
  laneQueue,
  moveQueueItem,
  queueStartBlocker,
  removeFromQueue,
  scheduleQueue,
  startFromQueue,
  targetForItem,
} from "@/service/upgradeQueue";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { BuilderBaseQueueItem } from "@/types/app/queue";

import { freshVillage } from "./fixtures";

const NOW = new Date("2026-03-01T12:00:00.000Z");
const HOUR = 3_600_000;
const options = { now: NOW, boostPercent: 0 as const };
const cannon: UpgradeTarget = { kind: "bbBuilding", record: "defenses", buildingId: "cannon", instanceIndex: 0 };

const item = (id: string, target: UpgradeTarget, targetLevel: number, hours = 10): BuilderBaseQueueItem => ({
  id,
  name: "x",
  targetLevel,
  durationMs: hours * HOUR,
  cost: 1000,
  costResource: "Builder Gold",
  imageUrl: "",
  target,
});

const villageWith = (build: (village: Playthrough) => void = () => {}): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.builderBase.builderHallLevel = 8;
  village.data.builderBase.defenses = { cannon: [{ level: 5 }] };
  build(village);
  return village;
};

describe("Builder Base queue storage", () => {
  it("keeps the builder queue and the Star Laboratory queue apart from the Home Village", () => {
    let village = addToQueue(villageWith(), "bbBuilder", 2, item("a", cannon, 6));
    village = addToQueue(village, "bbResearch", 1, item("t", { kind: "bbTroop", name: "Raged Barbarian" }, 2));
    expect(village.bbQueue?.builder?.["2"]).toHaveLength(1);
    expect(village.bbQueue?.research?.["1"]).toHaveLength(1);
    expect(village.data.homeVillage.builderQueues).toEqual(villageWith().data.homeVillage.builderQueues);
    expect(targetForItem(laneQueue(village, "bbBuilder", 2)[0])).toEqual(cannon);
  });

  it("refuses the same level twice, adds levels in order, moves between builders and removes", () => {
    let village = addToQueue(villageWith(), "bbBuilder", 1, item("a", cannon, 6));
    expect(addToQueue(village, "bbBuilder", 2, item("dup", cannon, 6))).toBe(village);
    village = addToQueue(village, "bbBuilder", 1, item("b", cannon, 7));
    village = moveQueueItem(village, "bbBuilder", "b", 2, 0);
    expect(laneQueue(village, "bbBuilder", 1).map((queued) => queued.id)).toEqual(["a"]);
    expect(laneQueue(village, "bbBuilder", 2).map((queued) => queued.id)).toEqual(["b"]);
    expect(laneQueue(removeFromQueue(village, "bbBuilder", "a"), "bbBuilder", 1)).toEqual([]);
  });
});

describe("Builder Base scheduling", () => {
  it("has two builders, no Gold Pass boost and one Star Laboratory lane", () => {
    const village = addToQueue(villageWith(), "bbBuilder", 1, item("a", cannon, 6));
    expect(scheduleQueue(village, "bbBuilder", false, options).lanes).toHaveLength(2);
    expect(scheduleQueue(village, "bbResearch", false, options).lanes).toHaveLength(1);
    expect(boostForLane("bbBuilder", village, NOW)).toBe(0);
    expect(boostForLane("bbResearch", village, NOW)).toBe(0);
  });

  it("flags a later level that starts before the earlier level is done on another builder", () => {
    let village = addToQueue(villageWith(), "bbBuilder", 1, item("a", cannon, 7));
    village = addToQueue(village, "bbBuilder", 2, item("b", cannon, 6));
    const { conflicts } = scheduleQueue(village, "bbBuilder", false, options);
    expect(conflicts.map((conflict) => conflict.itemId)).toEqual(["a"]);
  });

  it("starts a queued item on its builder and takes it off the queue", () => {
    const village = addToQueue(villageWith(), "bbBuilder", 2, item("a", cannon, 6));
    expect(queueStartBlocker(village, laneQueue(village, "bbBuilder", 2)[0])).toBeNull();
    const started = startFromQueue(village, "bbBuilder", 2, "a", { boostPercent: 0, now: NOW });
    expect(readUpgrade(started, cannon)?.builderId).toBe(2);
    expect(laneQueue(started, "bbBuilder", 2)).toEqual([]);
  });

  it("blocks a level whose earlier level is not built", () => {
    const village = addToQueue(villageWith(), "bbBuilder", 1, item("a", cannon, 8));
    expect(queueStartBlocker(village, laneQueue(village, "bbBuilder", 1)[0])).toBe("Level 6 must finish first");
  });
});

describe("Builder Base availability", () => {
  it("lists buildings, heroes, the Clock Tower and the Builder Hall, minus queued levels", () => {
    const village = villageWith();
    const groups = availableFor(village, "bbBuilder").groups;
    const cannonGroup = groups.find((group) => JSON.stringify(group.target) === JSON.stringify(cannon));
    expect(cannonGroup?.steps[0].level).toBe(6);
    expect(groups.some((group) => group.target.kind === "bbHero")).toBe(true);
    expect(groups.some((group) => group.target.kind === "builderHall")).toBe(true);

    const queued = addToQueue(village, "bbBuilder", 1, queueItemForGroup("bbBuilder", cannonGroup!, cannonGroup!.steps[0]));
    const after = availableFor(queued, "bbBuilder").groups.find((group) => JSON.stringify(group.target) === JSON.stringify(cannon));
    expect(after?.steps[0].level).toBe(7);
  });

  it("lists level 0 troops as locked with their first level, and unlocked troops with steps", () => {
    const village = villageWith();
    const locked = availableFor(village, "bbResearch").locked;
    expect(locked.length).toBeGreaterThan(0);
    const raged = locked.find((group) => group.name === "Raged Barbarian");
    expect(raged?.unlockLevel).toBeGreaterThan(0);

    const unlocked = structuredClone(village);
    unlocked.data.builderBase.troops = unlocked.data.builderBase.troops.map((troop) =>
      troop.name === "Raged Barbarian" ? { ...troop, level: 1 } : troop,
    );
    expect(readLevel(unlocked, { kind: "bbTroop", name: "Raged Barbarian" })).toBe(1);
    const group = availableFor(unlocked, "bbResearch").groups.find((candidate) => candidate.name === "Raged Barbarian");
    expect(group?.steps[0].level).toBe(2);
  });
});
