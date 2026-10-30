import { describe, expect, it } from "vitest";

import {
  costToHighest,
  highestWallLevel,
  lowestPlacedLevel,
  maxCountFor,
  movePrice,
  moveWalls,
  placedWalls,
  setWallCount,
  totalWallsAt,
  unplacedWalls,
  wallCount,
  wallLevelsAt,
} from "@/service/walls";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const villageWith = (walls: Record<string, number>, townHall = 12): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.townHallLevel = townHall;
  village.data.homeVillage.walls = walls;
  return village;
};

describe("wall facts", () => {
  it("knows the total and the highest level at a Town Hall", () => {
    expect(totalWallsAt(12)).toBe(300);
    expect(highestWallLevel(12)).toBe(13);
    expect(wallLevelsAt(12).at(-1)?.level).toBe(13);
  });

  it("holds 325 walls from Town Hall 14 through 18", () => {
    for (const townHall of [14, 15, 16, 17, 18]) expect(totalWallsAt(townHall)).toBe(325);
  });

  it("counts placed and unplaced walls", () => {
    const village = villageWith({ "7": 10, "8": 30, "9": 50, "10": 70, "11": 80, "12": 40, "13": 14 });
    expect(placedWalls(village)).toBe(294);
    expect(unplacedWalls(village)).toBe(6);
  });

  it("reports a negative number when more walls are placed than the Town Hall allows", () => {
    expect(unplacedWalls(villageWith({ "5": 400 }))).toBe(-100);
  });

  it("starts the list at the lowest level that holds walls", () => {
    expect(lowestPlacedLevel(villageWith({ "7": 10, "9": 5 }))).toBe(7);
    expect(lowestPlacedLevel(villageWith({}))).toBe(1);
  });
});

describe("moving walls", () => {
  it("lowers one level and raises another, and deletes an empty level", () => {
    const moved = moveWalls(villageWith({ "10": 5, "11": 2 }), 10, 11, 5);
    expect(moved.data.homeVillage.walls).toEqual({ "11": 7 });
  });

  it("moves to any higher level in one write", () => {
    const moved = moveWalls(villageWith({ "11": 10 }), 11, 13, 4);
    expect(moved.data.homeVillage.walls).toEqual({ "11": 6, "13": 4 });
  });

  it("moves no more than the level holds", () => {
    expect(moveWalls(villageWith({ "11": 3 }), 11, 12, 99).data.homeVillage.walls).toEqual({ "12": 3 });
  });

  it("does nothing for a lower level or no walls", () => {
    const village = villageWith({ "11": 3 });
    expect(moveWalls(village, 11, 10, 1)).toBe(village);
    expect(moveWalls(village, 9, 10, 1)).toBe(village);
  });
});

describe("price", () => {
  it("prices every level in between", () => {
    expect(movePrice(11, 13, 10)).toEqual({ amount: (1_000_000 + 1_500_000) * 10, resource: "Gold or Elixir" });
  });

  it("names Gold when only Gold levels are paid", () => {
    expect(movePrice(1, 4, 2)).toEqual({ amount: (1_000 + 5_000 + 10_000) * 2, resource: "Gold" });
  });

  it("totals the cost to bring placed walls to the highest level", () => {
    const { rows, total } = costToHighest(villageWith({ "12": 10, "13": 5 }));
    expect(rows).toEqual([{ level: 12, walls: 10, price: { amount: 15_000_000, resource: "Gold or Elixir" } }]);
    expect(total.amount).toBe(15_000_000);
  });
});

describe("set a count", () => {
  it("writes the count and deletes the level at 0", () => {
    expect(setWallCount(villageWith({ "7": 10 }), 8, 5).data.homeVillage.walls).toEqual({ "7": 10, "8": 5 });
    expect(setWallCount(villageWith({ "7": 10 }), 7, 0).data.homeVillage.walls).toEqual({});
  });

  it("stops at the walls still to place", () => {
    const village = villageWith({ "7": 10, "8": 285 });
    expect(maxCountFor(village, 9)).toBe(5);
    expect(wallCount(setWallCount(village, 9, 50), 9)).toBe(5);
    expect(wallCount(setWallCount(village, 8, 400), 8)).toBe(290);
  });
});
