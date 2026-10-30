import { describe, expect, it } from "vitest";

import { builderWalls, homeWalls } from "@/service/walls";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const villageWith = (walls: Record<string, number>, builderHall = 8): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.builderBase.builderHallLevel = builderHall;
  village.data.builderBase.walls = walls;
  return village;
};

describe("Builder Base walls", () => {
  it("knows the total and the highest level at a Builder Hall", () => {
    expect(builderWalls.totalWallsAt(8)).toBe(160);
    expect(builderWalls.highestWallLevel(8)).toBe(8);
    expect(builderWalls.totalWallsAt(10)).toBe(180);
    expect(builderWalls.highestWallLevel(10)).toBe(10);
  });

  it("counts placed and unplaced walls from the Builder Base record", () => {
    const village = villageWith({ "3": 50, "5": 60 });
    expect(builderWalls.placedWalls(village)).toBe(110);
    expect(builderWalls.unplacedWalls(village)).toBe(50);
    expect(homeWalls.placedWalls(village)).toBe(0);
  });

  it("prices moves in Builder Gold, and Builder Gold or Builder Elixir from level 7", () => {
    expect(builderWalls.movePrice(1, 3, 2)).toEqual({ amount: 24000, resource: "Builder Gold" });
    expect(builderWalls.movePrice(6, 8, 1)).toEqual({ amount: 1000000, resource: "Builder Gold or Builder Elixir" });
  });

  it("moves and sets counts only on the Builder Base record", () => {
    const village = villageWith({ "2": 10 }, 8);
    const moved = builderWalls.moveWalls(village, 2, 4, 6);
    expect(moved.data.builderBase.walls).toEqual({ "2": 4, "4": 6 });
    expect(moved.data.homeVillage.walls).toEqual(village.data.homeVillage.walls);
    const capped = builderWalls.setWallCount(village, 3, 999);
    expect(capped.data.builderBase.walls["3"]).toBe(150);
  });

  it("sums the cost to bring every wall to the top level", () => {
    const village = villageWith({ "7": 10, "8": 5 });
    const cost = builderWalls.costToHighest(village);
    expect(cost.rows).toEqual([{ level: 7, walls: 10, price: { amount: 6000000, resource: "Builder Gold or Builder Elixir" } }]);
    expect(cost.total.amount).toBe(6000000);
  });
});
