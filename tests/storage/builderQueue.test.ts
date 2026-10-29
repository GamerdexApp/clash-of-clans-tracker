import { describe, expect, it } from "vitest";

import {
  addToQueue,
  laneQueue,
  moveQueueItem,
  queueStartBlocker,
  removeFromQueue,
  scheduleQueue,
  startFromQueue,
  targetForItem,
} from "@/service/builderQueue";
import { readLevel, readUpgrade } from "@/service/upgradeEngine";
import type { Playthrough } from "@/types/app";
import type { BuilderQueueItem } from "@/types/app/queue";

import { freshVillage } from "./fixtures";

const NOW = new Date("2026-03-01T12:00:00.000Z");
const HOUR = 3_600_000;

const item = (id: string, overrides: Partial<BuilderQueueItem> = {}): BuilderQueueItem => ({
  id,
  name: "Cannon",
  targetLevel: 11,
  durationMs: 10 * HOUR,
  cost: 1000,
  costResource: "Gold",
  imageUrl: "",
  category: "defenses",
  buildingId: "cannon",
  instanceIndex: 0,
  ...overrides,
});

const villageWith = (build: (village: Playthrough) => void = () => {}): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.townHallLevel = 12;
  village.data.homeVillage.defenses = {
    "builders-hut": [{ level: 1 }, { level: 1 }],
    cannon: [{ level: 10 }, { level: 5 }],
  };
  build(village);
  return village;
};

const options = { now: NOW, boostPercent: 0 as const };

describe("queue edits", () => {
  it("adds to a lane in order and refuses a duplicate", () => {
    let village = addToQueue(villageWith(), 1, item("a"));
    village = addToQueue(village, 1, item("b", { targetLevel: 12 }));
    expect(laneQueue(village, 1).map((queued) => queued.id)).toEqual(["a", "b"]);
    expect(addToQueue(village, 2, item("c"))).toBe(village);
  });

  it("removes an item from any lane", () => {
    const village = addToQueue(addToQueue(villageWith(), 1, item("a")), 2, item("b", { instanceIndex: 1, targetLevel: 6 }));
    expect(laneQueue(removeFromQueue(village, "b"), 2)).toEqual([]);
  });

  it("reorders inside a lane and moves between lanes", () => {
    let village = addToQueue(villageWith(), 1, item("a"));
    village = addToQueue(village, 1, item("b", { targetLevel: 12 }));
    village = addToQueue(village, 1, item("c", { targetLevel: 13 }));
    expect(laneQueue(moveQueueItem(village, "c", 1, 0), 1).map((queued) => queued.id)).toEqual(["c", "a", "b"]);
    const moved = moveQueueItem(village, "a", 2, 0);
    expect(laneQueue(moved, 1).map((queued) => queued.id)).toEqual(["b", "c"]);
    expect(laneQueue(moved, 2).map((queued) => queued.id)).toEqual(["a"]);
  });
});

describe("schedule", () => {
  it("chains queued items after the running upgrade and counts totals", () => {
    let village = villageWith((v) => {
      v.data.homeVillage.defenses.cannon[1] = {
        level: 5,
        upgrade: { upgradeStartedAt: NOW.toISOString(), finishesAt: new Date(NOW.getTime() + 4 * HOUR).toISOString(), builderId: 1 },
      };
    });
    village = addToQueue(village, 1, item("a"));
    village = addToQueue(village, 1, item("b", { targetLevel: 12 }));

    const { lanes, totals } = scheduleQueue(village, false, options);
    const lane = lanes[0];
    expect(lane.blocks[0].startsAt.getTime()).toBe(NOW.getTime() + 4 * HOUR);
    expect(lane.blocks[1].startsAt.getTime()).toBe(NOW.getTime() + 14 * HOUR);
    expect(totals).toMatchObject({ freeBuilders: 1, totalBuilders: 2, queuedCount: 2, queuedMs: 20 * HOUR });
    expect(totals.costByResource).toEqual({ Gold: 2000 });
    expect(totals.allDoneAt?.getTime()).toBe(NOW.getTime() + 24 * HOUR);
  });

  it("uses the boosted duration for the schedule and the totals", () => {
    const village = addToQueue(villageWith(), 1, item("a"));
    const plain = scheduleQueue(village, false, options).totals.queuedMs;
    const boosted = scheduleQueue(village, false, { now: NOW, boostPercent: 20 }).totals.queuedMs;
    expect(boosted).toBeLessThan(plain);
  });

  it("waits for the active window when a block ends outside it", () => {
    const village = addToQueue(addToQueue(villageWith(), 1, item("a", { durationMs: 2 * HOUR })), 1, item("b", { targetLevel: 12, durationMs: HOUR }));
    const hours = { startUtcMinutes: 15 * 60, endUtcMinutes: 22 * 60 };
    const { lanes } = scheduleQueue(village, false, { now: NOW, boostPercent: 0, activeHours: hours });
    expect(lanes[0].blocks[0].startsAt.getUTCHours()).toBe(15);
    expect(lanes[0].blocks[1].startsAt.getTime()).toBeGreaterThanOrEqual(lanes[0].blocks[0].endsAt.getTime());
  });
});

describe("conflicts", () => {
  it("flags only the item that is scheduled before its earlier level", () => {
    let village = addToQueue(villageWith(), 1, item("high", { targetLevel: 12 }));
    village = addToQueue(village, 1, item("low", { targetLevel: 11 }));
    const { conflicts } = scheduleQueue(village, false, options);
    expect(conflicts.map((conflict) => conflict.itemId)).toEqual(["high"]);
    expect(conflicts[0].fix).toContain("after level 11");
  });

  it("does not flag levels in order on one lane", () => {
    let village = addToQueue(villageWith(), 1, item("low", { targetLevel: 11 }));
    village = addToQueue(village, 1, item("high", { targetLevel: 12 }));
    expect(scheduleQueue(village, false, options).conflicts).toEqual([]);
  });

  it("flags a higher level that starts on another lane before the lower level ends", () => {
    let village = addToQueue(villageWith(), 1, item("low", { targetLevel: 11 }));
    village = addToQueue(village, 2, item("high", { targetLevel: 12 }));
    expect(scheduleQueue(village, false, options).conflicts.map((conflict) => conflict.itemId)).toEqual(["high"]);
  });

  it("does not flag a higher level on another lane that starts after the lower level ends", () => {
    let village = villageWith((v) => {
      v.data.homeVillage.defenses.cannon[1] = {
        level: 5,
        upgrade: { upgradeStartedAt: NOW.toISOString(), finishesAt: new Date(NOW.getTime() + 12 * HOUR).toISOString(), builderId: 2 },
      };
    });
    village = addToQueue(village, 1, item("low", { targetLevel: 11 }));
    village = addToQueue(village, 2, item("high", { targetLevel: 12 }));
    expect(scheduleQueue(village, false, options).conflicts).toEqual([]);
  });

  it("flags a level the village already reached", () => {
    const village = addToQueue(villageWith(), 1, item("stale", { targetLevel: 10 }));
    expect(scheduleQueue(village, false, options).conflicts[0]).toMatchObject({ itemId: "stale", fix: "Remove it from the queue." });
  });
});

describe("starting from the queue", () => {
  it("blocks an item whose earlier level is not done and names it", () => {
    expect(queueStartBlocker(villageWith(), item("x", { targetLevel: 13 }))).toBe("Level 11 must finish first");
    expect(queueStartBlocker(villageWith(), item("x", { targetLevel: 11 }))).toBeNull();
    expect(queueStartBlocker(villageWith(), item("x", { targetLevel: 10 }))).toBe("Already at level 10");
  });

  it("removes the item and starts it with the boosted time", () => {
    const queued = addToQueue(villageWith(), 1, item("a"));
    const started = startFromQueue(queued, 1, "a", { boostPercent: 0, now: NOW });
    const target = targetForItem(item("a"));
    expect(laneQueue(started, 1)).toEqual([]);
    expect(readUpgrade(started, target)?.finishesAt).toBe(new Date(NOW.getTime() + 10 * HOUR).toISOString());
    expect(readLevel(started, target)).toBe(10);
  });
});

describe("targetForItem", () => {
  it("maps heroes, the Town Hall, its weapon and crafted modules from the stored shape", () => {
    expect(targetForItem(item("h", { category: "heroes", name: "Archer Queen", buildingId: "archer-queen" }))).toEqual({ kind: "hero", name: "Archer Queen" });
    expect(targetForItem(item("t", { category: "townHall", buildingId: "town-hall" }))).toEqual({ kind: "townHall" });
    expect(targetForItem(item("w", { category: "townHall", buildingId: "town-hall-weapon" }))).toEqual({ kind: "townHallWeapon" });
    expect(targetForItem(item("c", { category: "craftedDefenses", buildingId: "roaster", instanceIndex: 2 }))).toEqual({ kind: "crafted", defenseId: "roaster", moduleIndex: 2 });
  });
});
