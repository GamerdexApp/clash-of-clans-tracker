import { describe, expect, it } from "vitest";

import {
  boostedStep,
  builderSlots,
  cancelUpgrade,
  completeExpiredUpgrades,
  finishUpgrade,
  freeBuilderCount,
  readLevel,
  readUpgrade,
  runningUpgrades,
  setLevel,
  startBlocker,
  startUpgrade,
} from "@/service/upgradeEngine";
import { getBuildingUpgradeSteps } from "@/lib/utils/upgradeHelpers";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { UpgradeStep } from "@/types/app/upgrade";

import { freshVillage } from "./fixtures";

const NOW = new Date("2026-03-01T12:00:00.000Z");
const HOUR = 3_600_000;
const step = (overrides: Partial<UpgradeStep> = {}): UpgradeStep => ({
  level: 2,
  cost: 1000,
  costResource: "Gold",
  buildTime: { days: 0, hours: 10, minutes: 0, seconds: 0 },
  durationMs: 10 * HOUR,
  ...overrides,
});

const cannon: UpgradeTarget = { kind: "building", record: "defenses", buildingId: "cannon", instanceIndex: 0 };

const villageWith = (townHall: number, build: (village: Playthrough) => void = () => {}): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.townHallLevel = townHall;
  village.data.homeVillage.defenses = {
    "builders-hut": [{ level: 1 }, { level: 1 }, { level: 1 }],
    cannon: [{ level: 1 }],
  };
  build(village);
  return village;
};

describe("builder slots", () => {
  it("numbers huts 1 to 5, B.O.B as 6 and the Goblin Builder as 7", () => {
    const village = villageWith(12, (v) => {
      v.data.homeVillage.defenses["builders-hut"] = Array.from({ length: 5 }, () => ({ level: 1 }));
      v.data.homeVillage.armyBuildings = { "bobs-hut": [{ level: 1 }] };
    });
    const { slots } = builderSlots(village, true);
    expect(slots.map((slot) => slot.label)).toEqual([
      "Builder 1", "Builder 2", "Builder 3", "Builder 4", "Builder 5", "B.O.B", "Goblin Builder",
    ]);
  });

  it("keeps a slot number when an earlier hut is not built", () => {
    const village = villageWith(12, (v) => {
      v.data.homeVillage.defenses["builders-hut"] = [{ level: 1 }, { level: 0 }, { level: 1 }];
    });
    expect(builderSlots(village, false).slots.map((slot) => slot.id)).toEqual([1, 3]);
  });

  it("shows a running upgrade on a builder that no longer exists as unassigned", () => {
    const village = startUpgrade(villageWith(12), cannon, step(), 2, { boostPercent: 0, now: NOW });
    const gone = structuredClone(village);
    gone.data.homeVillage.defenses["builders-hut"] = [{ level: 1 }];
    const result = builderSlots(gone, false);
    expect(result.unassigned).toHaveLength(1);
    expect(freeBuilderCount(result)).toBe(1);
  });

  it("counts a crafted module and the Town Hall weapon as busy builders", () => {
    const village = villageWith(18, (v) => {
      v.data.homeVillage.craftedDefenses = {
        roaster: { modules: [0, 0, 0], moduleUpgrades: [undefined, { upgradeStartedAt: "a", finishesAt: "2099-01-01T00:00:00.000Z", builderId: 1 }, undefined] },
      };
      v.data.homeVillage.townHallWeaponUpgrade = { upgradeStartedAt: "a", finishesAt: "2099-01-01T00:00:00.000Z", builderId: 2 };
    });
    expect(freeBuilderCount(builderSlots(village, false))).toBe(1);
  });

  it("reads a crafted slot that a JSON round trip turned into null", () => {
    const village = villageWith(18, (v) => {
      v.data.homeVillage.craftedDefenses = {
        roaster: { modules: [0, 0, 0], moduleUpgrades: [null as never, { upgradeStartedAt: "a", finishesAt: "2099-01-01T00:00:00.000Z", builderId: 1 }, null as never] },
      };
    });
    expect(runningUpgrades(village)).toHaveLength(1);
  });
});

describe("starting", () => {
  it("stores the boosted finish time", () => {
    const boosted = startUpgrade(villageWith(12), cannon, step(), 1, { boostPercent: 20, now: NOW });
    const plain = startUpgrade(villageWith(12), cannon, step(), 1, { boostPercent: 0, now: NOW });
    const boostedMs = Date.parse(readUpgrade(boosted, cannon)!.finishesAt) - NOW.getTime();
    expect(Date.parse(readUpgrade(plain, cannon)!.finishesAt) - NOW.getTime()).toBe(10 * HOUR);
    expect(boostedMs).toBeLessThan(10 * HOUR);
    expect(boostedMs).toBeGreaterThan(7 * HOUR);
  });

  it("finishes a zero time build at once and uses no builder", () => {
    const hut: UpgradeTarget = { kind: "building", record: "defenses", buildingId: "builders-hut", instanceIndex: 3 };
    const village = startUpgrade(villageWith(12), hut, step({ level: 1, cost: 0, durationMs: 0 }), 99, { boostPercent: 0, now: NOW });
    expect(readLevel(village, hut)).toBe(1);
    expect(readUpgrade(village, hut)).toBeUndefined();
    expect(runningUpgrades(village)).toHaveLength(0);
  });

  it("lets a village with no huts build its first one", () => {
    const empty = villageWith(1, (v) => {
      v.data.homeVillage.defenses = {};
    });
    const hut: UpgradeTarget = { kind: "building", record: "defenses", buildingId: "builders-hut", instanceIndex: 0 };
    const free = step({ level: 1, cost: 0, durationMs: 0 });
    expect(startBlocker(empty, hut, free, 1, false)).toBeNull();
    expect(readLevel(startUpgrade(empty, hut, free, 1, { boostPercent: 0, now: NOW }), hut)).toBe(1);
  });

  it("blocks a busy builder, a missing builder and a second timer on the same item", () => {
    const running = startUpgrade(villageWith(12), cannon, step(), 1, { boostPercent: 0, now: NOW });
    const wall: UpgradeTarget = { kind: "building", record: "defenses", buildingId: "archer-tower", instanceIndex: 0 };
    expect(startBlocker(running, wall, step(), 1, false)).toBe("builderBusy");
    expect(startBlocker(running, wall, step(), 2, false)).toBeNull();
    expect(startBlocker(running, wall, step(), 5, false)).toBe("noSuchBuilder");
    expect(startBlocker(running, cannon, step(), 2, false)).toBe("alreadyRunning");
  });
});

describe("boostedStep", () => {
  it("discounts time and cost, but never a gem cost", () => {
    const gold = boostedStep(step({ cost: 1_000_000 }), 20);
    expect(gold.cost).toBe(800_000);
    expect(gold.durationMs).toBeLessThan(10 * HOUR);
    expect(boostedStep(step({ cost: 250, costResource: "Gems" }), 20).cost).toBe(250);
    expect(boostedStep(step(), 0)).toEqual({ durationMs: 10 * HOUR, cost: 1000 });
  });
});

describe("finishing", () => {
  const started = startUpgrade(villageWith(12), cannon, step(), 1, { boostPercent: 0, now: NOW });
  const halfway = new Date(NOW.getTime() + 4 * HOUR);

  it("Time Passed raises the level and saves no time", () => {
    const result = finishUpgrade(started, cannon, "timePassed", halfway);
    expect(readLevel(result.village, cannon)).toBe(2);
    expect(readUpgrade(result.village, cannon)).toBeUndefined();
    expect(result.timeSavedMs).toBe(0);
  });

  it.each(["gems", "book", "hammer"] as const)("%s saves the time that was left", (method) => {
    expect(finishUpgrade(started, cannon, method, halfway).timeSavedMs).toBe(6 * HOUR);
  });

  it("changes nothing when no upgrade is running", () => {
    const result = finishUpgrade(villageWith(12), cannon, "gems", NOW);
    expect(result.village).toEqual(villageWith(12));
  });

  it("cancel clears the timer and keeps the level", () => {
    const cancelled = cancelUpgrade(started, cannon);
    expect(readLevel(cancelled, cannon)).toBe(1);
    expect(readUpgrade(cancelled, cannon)).toBeUndefined();
  });

  it("finishing a hero raises its level", () => {
    const hero: UpgradeTarget = { kind: "hero", name: "Barbarian King" };
    const village = villageWith(12, (v) => {
      v.data.homeVillage.heroes = [{ name: "Barbarian King", level: 10, equipment: [] }];
    });
    const result = finishUpgrade(startUpgrade(village, hero, step(), 1, { boostPercent: 0, now: NOW }), hero, "timePassed", NOW);
    expect(readLevel(result.village, hero)).toBe(11);
  });

  it("finishing the Town Hall stamps thChangedAt and starts the weapon at 17", () => {
    const village = villageWith(16);
    const target: UpgradeTarget = { kind: "townHall" };
    const finished = finishUpgrade(startUpgrade(village, target, step(), 1, { boostPercent: 0, now: NOW }), target, "timePassed", NOW);
    expect(finished.village.data.homeVillage.townHallLevel).toBe(17);
    expect(finished.village.data.homeVillage.townHallWeaponLevel).toBe(1);
    expect(finished.village.thChangedAt).toBe("2026-03-01T00:00:00.000Z");
  });

  it("finishing weapon level N writes N", () => {
    const village = villageWith(17, (v) => {
      v.data.homeVillage.townHallWeaponLevel = 2;
    });
    const target: UpgradeTarget = { kind: "townHallWeapon" };
    const finished = finishUpgrade(startUpgrade(village, target, step({ level: 3 }), 1, { boostPercent: 0, now: NOW }), target, "timePassed", NOW);
    expect(finished.village.data.homeVillage.townHallWeaponLevel).toBe(3);
  });

  it("finishing a crafted module raises only that module", () => {
    const target: UpgradeTarget = { kind: "crafted", defenseId: "roaster", moduleIndex: 1 };
    const village = villageWith(18);
    const finished = finishUpgrade(startUpgrade(village, target, step(), 1, { boostPercent: 0, now: NOW }), target, "timePassed", NOW);
    expect(finished.village.data.homeVillage.craftedDefenses.roaster.modules).toEqual([0, 1, 0]);
    expect(finished.village.data.homeVillage.craftedDefenses.roaster.moduleUpgrades).toEqual([undefined, undefined, undefined]);
  });
});

describe("supercharge", () => {
  const maxedIds = ["cannon", "archer-tower", "mortar", "air-defense", "wizard-tower", "hidden-tesla", "bomb-tower", "x-bow", "inferno-tower", "eagle-artillery"];

  it("writes superchargeLevel and leaves level alone when the next step is a supercharge", () => {
    const found = maxedIds
      .flatMap((buildingId) =>
        Array.from({ length: 30 }, (_, level) => ({ buildingId, level })).filter(
          ({ buildingId: id, level }) => getBuildingUpgradeSteps(id, level, 18, 0, 0)[0]?.isSupercharge,
        ),
      )
      .at(0);
    expect(found, "the package should have at least one supercharge step").toBeDefined();

    const target: UpgradeTarget = { kind: "building", record: "defenses", buildingId: found!.buildingId, instanceIndex: 0 };
    const village = villageWith(18, (v) => {
      v.data.homeVillage.defenses[found!.buildingId] = [{ level: found!.level }];
    });
    const result = finishUpgrade(startUpgrade(village, target, step(), 1, { boostPercent: 0, now: NOW }), target, "timePassed", NOW);
    const instance = result.village.data.homeVillage.defenses[found!.buildingId][0];
    expect(instance.level).toBe(found!.level);
    expect(instance.superchargeLevel).toBe(1);
  });
});

describe("completing expired upgrades", () => {
  it("completes every ended timer in one pass and leaves running ones alone", () => {
    const hv = (v: Playthrough) => v.data.homeVillage;
    let village = villageWith(12, (v) => {
      v.data.homeVillage.defenses.cannon = [{ level: 1 }, { level: 1 }, { level: 1 }];
    });
    const targets: UpgradeTarget[] = [0, 1, 2].map((instanceIndex) => ({ ...cannon, instanceIndex }));
    village = startUpgrade(village, targets[0], step({ durationMs: 1 * HOUR }), 1, { boostPercent: 0, now: NOW });
    village = startUpgrade(village, targets[1], step({ durationMs: 2 * HOUR }), 2, { boostPercent: 0, now: NOW });
    village = startUpgrade(village, targets[2], step({ durationMs: 30 * HOUR }), 3, { boostPercent: 0, now: NOW });

    const later = new Date(NOW.getTime() + 5 * HOUR);
    const { village: after, completed } = completeExpiredUpgrades(village, later);

    expect(completed.map((entry) => [entry.fromLevel, entry.toLevel])).toEqual([[1, 2], [1, 2]]);
    expect(hv(after).defenses.cannon.map((instance) => instance.level)).toEqual([2, 2, 1]);
    expect(runningUpgrades(after)).toHaveLength(1);
  });

  it("returns the same village when nothing has ended", () => {
    const village = startUpgrade(villageWith(12), cannon, step(), 1, { boostPercent: 0, now: NOW });
    const result = completeExpiredUpgrades(village, NOW);
    expect(result.village).toBe(village);
    expect(result.completed).toEqual([]);
  });
});

describe("heroes that are not tracked yet", () => {
  it("adds the hero at level 0 when its first change is written", () => {
    const hero: UpgradeTarget = { kind: "hero", name: "Dragon Duke" };
    const village = villageWith(12, (v) => {
      v.data.homeVillage.heroes = [];
    });
    expect(readLevel(setLevel(village, hero, 3, NOW), hero)).toBe(3);
    const started = startUpgrade(village, hero, step(), 1, { boostPercent: 0, now: NOW });
    expect(readUpgrade(started, hero)).toBeDefined();
  });
});

describe("setting a level by hand", () => {
  it("sets a building level and never goes below 0", () => {
    expect(readLevel(setLevel(villageWith(12), cannon, 7, NOW), cannon)).toBe(7);
    expect(readLevel(setLevel(villageWith(12), cannon, -3, NOW), cannon)).toBe(0);
  });

  it("clears the supercharge when the level drops below the top normal level", () => {
    const village = villageWith(18, (v) => {
      v.data.homeVillage.defenses.cannon = [{ level: 21, superchargeLevel: 2 }];
    });
    const lowered = setLevel(village, cannon, 5, NOW).data.homeVillage.defenses.cannon[0];
    expect(lowered).toMatchObject({ level: 5, superchargeLevel: 0 });
  });

  it("stamps thChangedAt when the Town Hall level changes", () => {
    const changed = setLevel(villageWith(12), { kind: "townHall" }, 13, NOW);
    expect(changed.data.homeVillage.townHallLevel).toBe(13);
    expect(changed.thChangedAt).toBe("2026-03-01T00:00:00.000Z");
  });
});
