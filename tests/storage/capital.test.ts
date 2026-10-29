import { describe, expect, it } from "vitest";

import {
  buildingLevels,
  capitalArmy,
  capitalHallCost,
  changeCapitalHall,
  changeZoneHall,
  groupBuildings,
  maxDistrictHall,
  setArmyLevel,
  setBuildingLevel,
  setGroupLevels,
  setTracking,
  setWallCount,
  zoneIsOpen,
  zoneOpensAt,
  zoneProgress,
  zoneUnlockLevel,
  zoneWalls,
} from "@/service/capital";
import { clanCapitalState } from "@/service/navAccess";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const villageWith = (capitalHall: number, barbarianCamp = 0): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.townHallLevel = 12;
  village.data.clanCapital.capitalPeak.hallLevel = capitalHall;
  village.data.clanCapital.barbarianCamp.hallLevel = barbarianCamp;
  return village;
};

describe("Capital halls", () => {
  it("opens zones at the Capital Hall level the data names", () => {
    expect(zoneUnlockLevel("capitalPeak")).toBe(1);
    expect(zoneUnlockLevel("skeletonPark")).toBe(8);
    expect(zoneOpensAt(8)).toEqual(["Skeleton Park"]);
    expect(zoneIsOpen(villageWith(7), "skeletonPark")).toBe(false);
    expect(zoneIsOpen(villageWith(8), "skeletonPark")).toBe(true);
  });

  it("caps a District Hall by the Capital Hall", () => {
    expect(maxDistrictHall("barbarianCamp", 1)).toBe(0);
    expect(maxDistrictHall("barbarianCamp", 2)).toBe(1);
    expect(maxDistrictHall("barbarianCamp", 5)).toBe(3);
    expect(maxDistrictHall("goblinMines", 10)).toBe(4);
  });

  it("knows what the next Capital Hall costs", () => {
    expect(capitalHallCost(8)).toBe(600000);
  });

  it("separates locked, off and on", () => {
    const village = villageWith(1);
    expect(clanCapitalState(village)).toBe("on");
    expect(clanCapitalState(setTracking(village, false))).toBe("off");
    const low = structuredClone(village);
    low.data.homeVillage.townHallLevel = 2;
    expect(clanCapitalState(low)).toBe("locked");
  });
});

describe("Capital buildings", () => {
  it("sets one instance, clamps to the top level and leaves other zones alone", () => {
    const village = villageWith(5);
    const [first] = groupBuildings("capitalPeak", 5, "defenses");
    const set = setBuildingLevel(village, "capitalPeak", first, 0, 999);
    expect(buildingLevels(set, "capitalPeak", first)[0]).toBe(first.maxLevel);
    expect(set.data.clanCapital.barbarianCamp).toEqual(village.data.clanCapital.barbarianCamp);
  });

  it("maxes and clears a group", () => {
    const village = villageWith(5);
    const list = groupBuildings("capitalPeak", 5, "defenses");
    const maxed = setGroupLevels(village, "capitalPeak", list, "max");
    expect(buildingLevels(maxed, "capitalPeak", list[0]).every((level) => level === list[0].maxLevel)).toBe(true);
    const cleared = setGroupLevels(maxed, "capitalPeak", list, "clear");
    expect(buildingLevels(cleared, "capitalPeak", list[0]).every((level) => level === 0)).toBe(true);
  });

  it("reaches 100 percent of a zone", () => {
    let village = villageWith(3);
    for (const group of ["defenses", "traps"] as const) {
      village = setGroupLevels(village, "capitalPeak", groupBuildings("capitalPeak", 3, group), "max");
    }
    const info = zoneWalls("capitalPeak", 3);
    const top = info.levels.at(-1)!.level;
    village = setWallCount(village, "capitalPeak", top, info.totalCount);
    const { current, max } = zoneProgress(village, "capitalPeak");
    expect(current).toBe(max);
  });
});

describe("Capital walls", () => {
  it("clamps a count to the walls left in the zone and keeps zero counts", () => {
    const village = villageWith(5);
    const info = zoneWalls("capitalPeak", 5);
    const levels = info.levels.map((level) => level.level);
    let next = setWallCount(village, "capitalPeak", levels[0], info.totalCount - 1);
    next = setWallCount(next, "capitalPeak", levels[1], 99);
    expect(next.data.clanCapital.capitalPeak.walls?.[String(levels[1])]).toBe(1);
    next = setWallCount(next, "capitalPeak", levels[1], 0);
    expect(next.data.clanCapital.capitalPeak.walls).toHaveProperty(String(levels[1]), 0);
  });
});

describe("Changing a hall", () => {
  it("never resets when raising", () => {
    let village = villageWith(5);
    village = setGroupLevels(village, "capitalPeak", groupBuildings("capitalPeak", 5, "defenses"), "max");
    const raised = changeZoneHall(village, "capitalPeak", 6);
    expect(raised.resets).toEqual([]);
    const list = groupBuildings("capitalPeak", 5, "defenses");
    expect(buildingLevels(raised.village, "capitalPeak", list[0])).toEqual(buildingLevels(village, "capitalPeak", list[0]));
  });

  it("lists and applies only what no longer fits when lowering", () => {
    let village = villageWith(8);
    village = setGroupLevels(village, "capitalPeak", groupBuildings("capitalPeak", 8, "defenses"), "max");
    const lowered = changeZoneHall(village, "capitalPeak", 2);
    expect(lowered.resets[0].zone).toBe("Capital Peak");
    expect(lowered.resets[0].lines.length).toBeGreaterThan(0);
    const kept = groupBuildings("capitalPeak", 2, "defenses");
    for (const building of kept) {
      expect(buildingLevels(lowered.village, "capitalPeak", building).every((level) => level <= building.maxLevel)).toBe(true);
    }
    expect(lowered.village.data.clanCapital.capitalPeak.hallLevel).toBe(2);
  });

  it("lowers a District Hall the lowered Capital Hall no longer allows", () => {
    const village = villageWith(8, 5);
    const lowered = changeCapitalHall(village, 3);
    expect(lowered.village.data.clanCapital.barbarianCamp.hallLevel).toBe(maxDistrictHall("barbarianCamp", 3));
    expect(lowered.resets.some((reset) => reset.zone === "Barbarian Camp")).toBe(true);
  });
});

describe("Capital troops and spells", () => {
  it("lists 17 troops and 7 spells", () => {
    const army = capitalArmy(villageWith(1));
    expect(army.filter((entry) => entry.kind === "troops")).toHaveLength(17);
    expect(army.filter((entry) => entry.kind === "spells")).toHaveLength(7);
  });

  it("locks an entry until its zone and District Hall allow it, and says what it needs", () => {
    const closed = capitalArmy(villageWith(1)).find((entry) => entry.maxLevel === 0 && entry.requirement?.capitalHall);
    expect(closed?.requirement?.capitalHall).toBeGreaterThan(1);
    const noHall = capitalArmy(villageWith(5, 0)).find((entry) => entry.district === "Barbarian Camp");
    expect(noHall?.maxLevel).toBe(0);
    expect(noHall?.requirement).toEqual({ capitalHall: null, districtHall: expect.any(Number), zone: "Barbarian Camp" });
    const open = capitalArmy(villageWith(5, 3)).find((entry) => entry.district === "Barbarian Camp");
    expect(open?.maxLevel).toBeGreaterThan(0);
    expect(open?.requirement).toBeNull();
  });

  it("sets a level up to the allowed top and keeps a saved level on a locked entry", () => {
    const village = villageWith(5, 3);
    const entry = capitalArmy(village).find((candidate) => candidate.district === "Barbarian Camp" && candidate.maxLevel > 0)!;
    const set = setArmyLevel(village, entry.kind, entry.name, 999);
    expect(capitalArmy(set).find((candidate) => candidate.name === entry.name)?.level).toBe(entry.maxLevel);

    const lowered = changeZoneHall(set, "barbarianCamp", 0).village;
    const locked = capitalArmy(lowered).find((candidate) => candidate.name === entry.name)!;
    expect(locked.maxLevel).toBe(0);
    expect(locked.level).toBe(entry.maxLevel);
    expect(setArmyLevel(lowered, entry.kind, entry.name, 1)).toBe(lowered);
  });
});
