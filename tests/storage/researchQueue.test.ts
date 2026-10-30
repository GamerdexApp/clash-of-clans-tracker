import { describe, expect, it } from "vitest";

import { availableResearch, researchQueueItemFor } from "@/service/availableResearch";
import { queueItemForGroup } from "@/service/queueAvailability";
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
import type { PetQueueItem, ResearchQueueItem } from "@/types/app/queue";

import { freshVillage } from "./fixtures";

const NOW = new Date("2026-03-01T12:00:00.000Z");
const HOUR = 3_600_000;
const options = { now: NOW, boostPercent: 0 as const };

const researchItem = (id: string, level: number, overrides: Partial<ResearchQueueItem> = {}): ResearchQueueItem => ({
  id,
  name: "Archer",
  targetLevel: level,
  durationMs: 10 * HOUR,
  cost: 1000,
  costResource: "Elixir",
  imageUrl: "",
  category: "troops",
  ...overrides,
});

const petItem = (id: string, level: number, name = "L.A.S.S.I"): PetQueueItem => ({
  id,
  name,
  targetLevel: level,
  durationMs: 20 * HOUR,
  cost: 5000,
  costResource: "Dark Elixir",
  imageUrl: "",
});

const villageWith = (build: (village: Playthrough) => void = () => {}): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.townHallLevel = 14;
  village.data.homeVillage.troops = [{ name: "Archer", level: 4 }];
  village.data.homeVillage.pets = [{ name: "L.A.S.S.I", level: 1 }];
  village.data.homeVillage.armyBuildings = { laboratory: [{ level: 12 }], "pet-house": [{ level: 4 }] };
  build(village);
  return village;
};

describe("research queue storage", () => {
  it("keeps the saved shape: lanes by id under researchQueue", () => {
    const village = addToQueue(villageWith(), "research", 1, researchItem("a", 5));
    expect(village.data.homeVillage.researchQueue).toEqual({ "1": [researchItem("a", 5)] });
    expect(laneQueue(village, "research", 1).map((item) => item.id)).toEqual(["a"]);
  });

  it("ignores the same level queued twice, even on the other lane", () => {
    const village = addToQueue(villageWith(), "research", 1, researchItem("a", 5));
    expect(addToQueue(village, "research", 7, researchItem("b", 5))).toBe(village);
  });

  it("moves an item between the Laboratory and the Goblin Researcher", () => {
    let village = addToQueue(villageWith(), "research", 1, researchItem("a", 5));
    village = moveQueueItem(village, "research", "a", 7, 0);
    expect(laneQueue(village, "research", 1)).toEqual([]);
    expect(laneQueue(village, "research", 7).map((item) => item.id)).toEqual(["a"]);
  });

  it("does not touch the builder queue", () => {
    const village = addToQueue(villageWith(), "research", 1, researchItem("a", 5));
    expect(village.data.homeVillage.builderQueues).toBeUndefined();
  });
});

describe("pet queue storage", () => {
  it("keeps the saved shape: one flat list under petQueue", () => {
    let village = addToQueue(villageWith(), "pet", 1, petItem("a", 2));
    village = addToQueue(village, "pet", 1, petItem("b", 3));
    expect(village.data.homeVillage.petQueue?.map((item) => item.id)).toEqual(["a", "b"]);
    expect(laneQueue(village, "pet", 1)).toHaveLength(2);
  });

  it("removes and reorders inside the single lane", () => {
    let village = addToQueue(addToQueue(villageWith(), "pet", 1, petItem("a", 2)), "pet", 1, petItem("b", 3));
    village = moveQueueItem(village, "pet", "b", 1, 0);
    expect(village.data.homeVillage.petQueue?.map((item) => item.id)).toEqual(["b", "a"]);
    expect(removeFromQueue(village, "pet", "b").data.homeVillage.petQueue?.map((item) => item.id)).toEqual(["a"]);
  });
});

describe("targets", () => {
  it("reads research and pet items from their stored shape", () => {
    expect(targetForItem(researchItem("a", 5))).toEqual({ kind: "research", record: "troops", name: "Archer" });
    expect(targetForItem(petItem("p", 2))).toEqual({ kind: "pet", name: "L.A.S.S.I" });
  });
});

describe("schedule", () => {
  it("lines research up on the Laboratory and boosts it with the research boost", () => {
    let village = addToQueue(villageWith(), "research", 1, researchItem("a", 5));
    village = addToQueue(village, "research", 1, researchItem("b", 6));
    const plain = scheduleQueue(village, "research", false, options);
    expect(plain.lanes).toHaveLength(1);
    expect(plain.totals.queuedMs).toBe(20 * HOUR);
    expect(scheduleQueue(village, "research", false, { now: NOW, boostPercent: 20 }).totals.queuedMs).toBe(16 * HOUR);
  });

  it("adds the Goblin Researcher lane only when it is on", () => {
    const village = villageWith();
    expect(scheduleQueue(village, "research", true, options).lanes).toHaveLength(2);
    expect(scheduleQueue(village, "research", false, options).lanes).toHaveLength(1);
  });

  it("starts the queue after the running pet upgrade", () => {
    const running = { upgradeStartedAt: NOW.toISOString(), finishesAt: new Date(NOW.getTime() + 5 * HOUR).toISOString(), builderId: 1 };
    const village = addToQueue(
      villageWith((v) => {
        v.data.homeVillage.pets = [{ name: "L.A.S.S.I", level: 1, upgrade: running }];
      }),
      "pet",
      1,
      petItem("a", 3),
    );
    const { lanes } = scheduleQueue(village, "pet", false, options);
    expect(lanes[0].blocks[0].startsAt.getTime()).toBe(NOW.getTime() + 5 * HOUR);
  });

  it("flags a higher level scheduled before the level it needs", () => {
    let village = addToQueue(villageWith(), "research", 1, researchItem("high", 6));
    village = addToQueue(village, "research", 1, researchItem("low", 5));
    const { conflicts } = scheduleQueue(village, "research", false, options);
    expect(conflicts.map((conflict) => conflict.itemId)).toEqual(["high"]);
  });
});

describe("starting from the queue", () => {
  it("starts research on the lane it waits on and removes it from the queue", () => {
    const queued = addToQueue(villageWith(), "research", 1, researchItem("a", 5));
    const started = startFromQueue(queued, "research", 1, "a", options);
    expect(readUpgrade(started, { kind: "research", record: "troops", name: "Archer" })?.builderId).toBe(1);
    expect(laneQueue(started, "research", 1)).toEqual([]);
    expect(readLevel(started, { kind: "research", record: "troops", name: "Archer" })).toBe(4);
  });

  it("starts a pet on the Pet House", () => {
    const started = startFromQueue(addToQueue(villageWith(), "pet", 1, petItem("a", 2)), "pet", 1, "a", options);
    expect(started.data.homeVillage.pets[0].upgrade?.builderId).toBe(1);
    expect(started.data.homeVillage.petQueue).toEqual([]);
  });

  it("says why a level cannot start yet", () => {
    expect(queueStartBlocker(villageWith(), researchItem("a", 7))).toBe("Level 5 must finish first");
    expect(queueStartBlocker(villageWith(), researchItem("a", 3))).toBe("Already at level 4");
    expect(queueStartBlocker(villageWith(), researchItem("a", 5))).toBeNull();
  });

  it("says when the Pet House is missing", () => {
    const village = villageWith((v) => {
      v.data.homeVillage.armyBuildings = {};
    });
    expect(queueStartBlocker(village, petItem("p", 2))).toBe("Build a Pet House first");
  });
});

describe("what can be added", () => {
  it("lists levels after the current one and leaves out what is queued", () => {
    const village = addToQueue(villageWith(), "research", 1, researchItem("a", 5));
    const archer = availableResearch(village, false).groups.find((group) => group.name === "Archer");
    expect(archer?.steps[0].level).toBe(6);
  });

  it("lists a level 0 item to unlock first, with nothing to queue", () => {
    const { groups, locked } = availableResearch(villageWith(), false);
    const barbarian = locked.find((group) => group.name === "Barbarian");
    expect(barbarian?.steps).toEqual([]);
    expect(groups.some((group) => group.name === "Barbarian")).toBe(false);
  });

  it("keeps pets out of the research list and research out of the pet list", () => {
    const village = villageWith();
    expect(availableResearch(village, false).groups.some((group) => group.target.kind === "pet")).toBe(false);
    expect(availableResearch(village, true).groups.every((group) => group.target.kind === "pet")).toBe(true);
  });

  it("builds a queue item without a category for a pet, and with one for research", () => {
    const village = villageWith();
    const pet = availableResearch(village, true).groups[0];
    const research = availableResearch(village, false).groups.find((group) => group.name === "Archer")!;
    expect("category" in researchQueueItemFor(pet, pet.steps[0])).toBe(false);
    expect(queueItemForGroup("research", research, research.steps[0])).toMatchObject({ category: "troops", name: "Archer" });
  });
});
