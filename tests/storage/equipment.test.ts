import { describe, expect, it } from "vitest";

import {
  blacksmithLevel,
  deductOre,
  equipmentForHero,
  equipmentLevel,
  highestAllowedLevel,
  oreShortage,
  remainingSteps,
  setEquipmentLevel,
  stepRequirement,
  totalOre,
  upgradeEquipment,
} from "@/service/equipment";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const villageWith = (build: (village: Playthrough) => void = () => {}): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.armyBuildings = { blacksmith: [{ level: 5 }] };
  build(village);
  return village;
};

const puppet = equipmentForHero("archer-queen").find((piece) => piece.name === "Archer Puppet")!;

describe("equipment levels", () => {
  it("reads a piece the player has not added as level 0", () => {
    expect(equipmentLevel(villageWith(), "Archer Queen", "Archer Puppet")).toBe(0);
  });

  it("adds the piece to the hero when the first one is written", () => {
    const village = setEquipmentLevel(villageWith(), "Archer Queen", "Archer Puppet", 1);
    const hero = village.data.homeVillage.heroes.find((candidate) => candidate.name === "Archer Queen");
    expect(hero?.equipment).toEqual([{ name: "Archer Puppet", level: 1 }]);
  });

  it("adds a hero the village does not track yet", () => {
    const village = villageWith((v) => (v.data.homeVillage.heroes = []));
    expect(setEquipmentLevel(village, "Archer Queen", "Archer Puppet", 1).data.homeVillage.heroes).toEqual([
      { name: "Archer Queen", level: 0, equipment: [{ name: "Archer Puppet", level: 1 }] },
    ]);
  });

  it("changes only the one piece and keeps the others", () => {
    let village = setEquipmentLevel(villageWith(), "Archer Queen", "Archer Puppet", 3);
    village = setEquipmentLevel(village, "Archer Queen", "Invisibility Vial", 2);
    village = setEquipmentLevel(village, "Archer Queen", "Archer Puppet", 4);
    expect(village.data.homeVillage.heroes.find((hero) => hero.name === "Archer Queen")?.equipment).toEqual([
      { name: "Archer Puppet", level: 4 },
      { name: "Invisibility Vial", level: 2 },
    ]);
  });

  it("keeps two quick upgrades, because each reads the latest village", () => {
    const once = upgradeEquipment(villageWith(), "Archer Queen", puppet, { deduct: false });
    const twice = upgradeEquipment(once, "Archer Queen", puppet, { deduct: false });
    expect(equipmentLevel(twice, "Archer Queen", "Archer Puppet")).toBe(2);
  });
});

describe("steps", () => {
  it("starts a piece at level 0 with its free level 1, not level 2", () => {
    const steps = remainingSteps(puppet, 0);
    expect(steps[0].level).toBe(1);
    expect(steps[0].ore).toEqual({ shiny: 0, glowing: 0, starry: 0 });
    expect(steps[1].ore.shiny).toBe(120);
  });

  it("sums the ore of the levels left", () => {
    const left = remainingSteps(puppet, 16);
    expect(totalOre(left).shiny).toBe(left.reduce((sum, step) => sum + step.ore.shiny, 0));
    expect(left.map((step) => step.level)).toEqual([17, 18]);
  });

  it("is empty at the top level", () => {
    expect(remainingSteps(puppet, puppet.maxLevel)).toEqual([]);
  });
});

describe("blacksmith", () => {
  it("reads the Blacksmith level", () => {
    expect(blacksmithLevel(villageWith())).toBe(5);
    expect(blacksmithLevel(villageWith((v) => (v.data.homeVillage.armyBuildings = {})))).toBe(0);
  });

  it("names the Blacksmith level a step still needs", () => {
    const top = puppet.steps.at(-1)!;
    expect(stepRequirement(top, 1)).toBe(top.blacksmith);
    expect(stepRequirement(top, top.blacksmith)).toBeNull();
  });

  it("finds the highest level a Blacksmith allows", () => {
    expect(highestAllowedLevel(puppet, 99)).toBe(puppet.maxLevel);
    expect(highestAllowedLevel(puppet, 1)).toBeLessThan(puppet.maxLevel);
  });
});

describe("ore stock", () => {
  const stock = { shiny: 1000, glowing: 50, starry: 0 };

  it("takes the step cost out when asked, never below 0", () => {
    const village = villageWith((v) => (v.oreStock = { shiny: 100, glowing: 0, starry: 0 }));
    const after = upgradeEquipment(setEquipmentLevel(village, "Archer Queen", puppet.name, 1), "Archer Queen", puppet, { deduct: true });
    expect(equipmentLevel(after, "Archer Queen", puppet.name)).toBe(2);
    expect(after.oreStock).toEqual({ shiny: 0, glowing: 0, starry: 0 });
  });

  it("leaves the stock alone when deduct is off", () => {
    const village = villageWith((v) => (v.oreStock = stock));
    const after = upgradeEquipment(setEquipmentLevel(village, "Archer Queen", puppet.name, 1), "Archer Queen", puppet, { deduct: false });
    expect(after.oreStock).toEqual(stock);
  });

  it("still upgrades when the stock is short, because ore is advice only", () => {
    const after = upgradeEquipment(setEquipmentLevel(villageWith(), "Archer Queen", puppet.name, 1), "Archer Queen", puppet, { deduct: true });
    expect(equipmentLevel(after, "Archer Queen", puppet.name)).toBe(2);
  });

  it("reports how short each kind is", () => {
    expect(oreShortage(stock, { shiny: 1200, glowing: 20, starry: 5 })).toEqual({ shiny: 200, glowing: 0, starry: 5 });
  });

  it("deducts from a village with no stock saved as from zero", () => {
    expect(deductOre(villageWith(), { shiny: 5, glowing: 0, starry: 0 }).oreStock).toEqual({ shiny: 0, glowing: 0, starry: 0 });
  });
});
