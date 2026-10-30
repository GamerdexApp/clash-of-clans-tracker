import { describe, expect, it } from "vitest";

import {
  achievementList,
  achievementsOf,
  areaProgress,
  editAchievement,
  rewardTotals,
  starProgress,
  targetForStars,
} from "@/service/achievements";

import { freshVillage } from "./fixtures";

const village = () => structuredClone(freshVillage("v", "V"));

describe("Achievements", () => {
  it("lists every achievement of the game for a fresh village", () => {
    const list = achievementList(village());
    expect(list).toHaveLength(58);
    expect(achievementsOf(list, "home").length + achievementsOf(list, "builderBase").length + achievementsOf(list, "clanCapital").length).toBe(58);
  });

  it("counts stars against three per achievement and rounds down", () => {
    const base = village();
    const list = achievementList(base);
    expect(starProgress(list)).toEqual({ stars: 0, maxStars: 174, percent: 0 });
    const edited = editAchievement(base, list[0].name, list[0].village as "home", { stars: 3 });
    const after = starProgress(achievementList(edited));
    expect(after.stars).toBe(3);
    expect(after.percent).toBe(Math.floor((3 / 174) * 100));
    expect(areaProgress(achievementList(edited), "home").maxStars).toBe(achievementsOf(list, "home").length * 3);
  });

  it("moves the target to the next tier when the stars change and ticks Manual", () => {
    const base = village();
    const entry = achievementList(base).find((candidate) => (targetForStars(candidate.name, 1) ?? 0) > (targetForStars(candidate.name, 0) ?? 0))!;
    const edited = editAchievement(base, entry.name, entry.village as "home", { stars: 1 });
    const saved = edited.data.achievements.find((candidate) => candidate.name === entry.name)!;
    expect(saved.stars).toBe(1);
    expect(saved.target).toBe(targetForStars(entry.name, 1));
    expect(saved.isManual).toBe(true);
  });

  it("keeps the target when only the value changes and clamps to whole numbers from zero", () => {
    const base = village();
    const entry = achievementList(base)[0];
    const edited = editAchievement(base, entry.name, entry.village as "home", { value: -5.7 });
    const saved = edited.data.achievements.find((candidate) => candidate.name === entry.name)!;
    expect(saved.value).toBe(0);
    expect(saved.target).toBe(entry.target);
    expect(editAchievement(base, entry.name, entry.village as "home", { value: 12.9 }).data.achievements[0].value).toBe(12);
  });

  it("never passes three stars", () => {
    const base = village();
    const entry = achievementList(base)[0];
    expect(editAchievement(base, entry.name, entry.village as "home", { stars: 9 }).data.achievements[0].stars).toBe(3);
  });

  it("can turn Manual off again", () => {
    const base = village();
    const entry = achievementList(base)[0];
    const manual = editAchievement(base, entry.name, entry.village as "home", { value: 1 });
    expect(editAchievement(manual, entry.name, entry.village as "home", { manual: false }).data.achievements[0].isManual).toBe(false);
  });
});

describe("Achievements with a named requirement", () => {
  it("counts the tier when the requirement is a building name", () => {
    const entry = achievementList(village()).find((candidate) => candidate.name === "Hidden Treasures")!;
    expect(entry.target).toBe(1);
    expect(entry.info).toContain("Gem Mine");
    expect(targetForStars("Hidden Treasures", 1)).toBe(2);
  });
});

describe("Achievement rewards", () => {
  it("totals the gems and XP of the first three stars and what the stars earned", () => {
    const base = village();
    const list = achievementList(base);
    const none = rewardTotals(list);
    expect(none.gems.earned).toBe(0);
    expect(none.xp.earned).toBe(0);
    expect(none.gems.total).toBeGreaterThan(0);
    const entry = list[0];
    const edited = achievementList(editAchievement(base, entry.name, entry.village as "home", { stars: 1 }));
    const after = rewardTotals(edited);
    expect(after.gems.total).toBe(none.gems.total);
    expect(after.gems.earned).toBeGreaterThan(0);
    expect(after.xp.earned).toBeGreaterThan(0);
  });
});
