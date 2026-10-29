import { describe, expect, it } from "vitest";

import { dailiesOf, markUsed, setResetTime, setResetTimeAndMarkUsed, timerState } from "@/service/dailies";
import {
  autoCycleEnd,
  autoForgeOpen,
  clearSlot,
  forgeDurationMs,
  forgeRate,
  forgeRates,
  formatResourceAmount,
  openSlotCount,
  slotState,
  slotTownHall,
  startAutoForge,
  startSlot,
  stopAutoForge,
} from "@/service/forge";
import {
  acceptRollover,
  goldPassBoosts,
  restoreRolledBoosts,
  rolledBoosts,
  setBoost,
} from "@/service/goldPass";
import {
  alchemistOutput,
  assignUpgrade,
  assignmentView,
  oreOutput,
  setAssignmentMode,
  setHelperLevel,
  applyHelperUse,
  previewHelperUse,
} from "@/service/helpers";
import { cancelUpgrade, completeUpgrade, readUpgrade, writeUpgrade } from "@/service/upgradeEngine";
import { readAssignment } from "@/service/helperAssignments";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";

import { freshVillage } from "./fixtures";

const HOUR = 3_600_000;
const at = (iso: string) => new Date(iso);

const village = (townHall = 12, builderHall = 8): Playthrough => {
  const base = structuredClone(freshVillage("v", "V"));
  base.data.homeVillage.townHallLevel = townHall;
  base.data.builderBase.builderHallLevel = builderHall;
  return base;
};

const cannon: UpgradeTarget = { kind: "building", record: "defenses", buildingId: "cannon", instanceIndex: 0 };

const withRunningCannon = (finishesAt: string): Playthrough => {
  const base = village();
  base.data.homeVillage.defenses = { cannon: [{ level: 5 }] };
  return writeUpgrade(base, cannon, { upgradeStartedAt: "2026-10-01T00:00:00.000Z", finishesAt, builderId: 1 });
};

describe("Daily timers", () => {
  const now = at("2026-10-20T09:00:00");

  it("has three states: not set, available and counting", () => {
    const dailies = dailiesOf(village());
    expect(timerState(dailies.capitalGold, now)).toBe("notSet");
    const timed = setResetTime(dailies, "capitalGold", "06:00");
    expect(timerState(timed.capitalGold, now)).toBe("available");
    const used = markUsed(timed, "capitalGold", at("2026-10-20T07:00:00"));
    expect(timerState(used.capitalGold, now)).toBe("counting");
  });

  it("becomes available again after the next reset", () => {
    const used = markUsed(setResetTime(dailiesOf(village()), "capitalGold", "06:00"), "capitalGold", at("2026-10-20T07:00:00"));
    expect(timerState(used.capitalGold, at("2026-10-21T05:59:00"))).toBe("counting");
    expect(timerState(used.capitalGold, at("2026-10-21T06:00:00"))).toBe("available");
  });

  it("sets the reset time without marking the reward used", () => {
    const timed = setResetTime(dailiesOf(village()), "alchemist", "07:30");
    expect(timed.helpers.alchemist).toEqual({ resetTime: "07:30", lastCollectedAt: null });
  });

  it("sets the reset time and marks the reward used in one step", () => {
    const both = setResetTimeAndMarkUsed(dailiesOf(village()), "starBonus", "05:00", now);
    expect(both.starBonus.resetTime).toBe("05:00");
    expect(both.starBonus.lastCollectedAt).toBe(now.toISOString());
  });
});

describe("Forge", () => {
  it("reads slot unlocks and resource gates from the data", () => {
    expect([1, 2, 3, 4].map(slotTownHall)).toEqual([9, 11, 12, 14]);
    expect(openSlotCount(12)).toBe(3);
    expect(forgeRate("darkElixir", "manual", 12, 8)).toMatchObject({ available: false, requirement: "Town Hall 13" });
    expect(forgeRate("darkElixir", "manual", 13, 8)).toMatchObject({ available: true, cost: 60000, capitalGold: 2000 });
    expect(forgeRate("builderGold", "manual", 12, 7)).toMatchObject({ available: false, requirement: "Builder Hall 8" });
    expect(forgeRate("builderGold", "manual", 12, 8)).toMatchObject({ available: true, cost: 1800000 });
  });

  it("lists only the Builder Base resources below Town Hall 7", () => {
    expect(forgeRates("manual", 6, 8).map((rate) => rate.type)).toEqual(["builderGold", "builderElixir"]);
    expect(forgeRates("manual", 7, 1)).toHaveLength(5);
  });

  it("charges half price in Auto Forge", () => {
    expect(forgeRate("gold", "auto", 12, 8).cost).toBe(forgeRate("gold", "manual", 12, 8).cost / 2);
  });

  it("prints amounts under a million in full", () => {
    expect(formatResourceAmount(60000)).toBe("60,000");
    expect(formatResourceAmount(4_800_000)).toBe("4.8M");
    expect(formatResourceAmount(3_000_000)).toBe("3M");
  });

  it("shortens the crafting time with the builder boost", () => {
    expect(forgeDurationMs(0)).toBe(72 * HOUR);
    expect(forgeDurationMs(20)).toBe(57.6 * HOUR);
  });

  it("starts a slot at the boosted time and is done only after it ends", () => {
    const now = at("2026-10-20T09:00:00");
    const boosted = setBoost(village(), "builder", 20, now);
    const started = startSlot(boosted, 1, forgeRate("elixir", "manual", 12, 8), now);
    const slot = dailiesOf(started).forgeSlots[1];
    expect(slot).toMatchObject({ resourceType: "elixir", durationMs: 57.6 * HOUR, capitalGoldOutput: 1600, resourceCost: 4_800_000 });
    expect(slotState(slot, now)).toBe("running");
    expect(slotState(slot, new Date(now.getTime() + 57.6 * HOUR))).toBe("done");
  });

  it("clears a slot back to idle", () => {
    const now = at("2026-10-20T09:00:00");
    const started = startSlot(village(), 0, forgeRate("gold", "manual", 12, 8), now);
    expect(dailiesOf(clearSlot(started, 0)).forgeSlots[0]).toEqual({
      resourceType: null,
      endsAt: null,
      durationMs: 0,
      capitalGoldOutput: 0,
      resourceCost: 0,
    });
  });

  it("repeats Auto Forge from the saved end time", () => {
    const now = at("2026-10-20T09:00:00");
    const started = startAutoForge(village(), forgeRate("gold", "auto", 12, 8), now);
    const auto = dailiesOf(started).autoForge;
    const firstEnd = Date.parse(auto.endsAt!);
    expect(autoCycleEnd(auto, now)).toBe(firstEnd);
    const afterOneRun = new Date(firstEnd + 1000);
    expect(autoCycleEnd(auto, afterOneRun)).toBe(firstEnd + auto.durationMs);
    const afterThree = new Date(firstEnd + 2 * auto.durationMs + 1000);
    expect(autoCycleEnd(auto, afterThree)).toBe(firstEnd + 3 * auto.durationMs);
  });

  it("clears every Auto Forge field on stop", () => {
    const started = startAutoForge(village(), forgeRate("gold", "auto", 12, 8), at("2026-10-20T09:00:00"));
    expect(dailiesOf(stopAutoForge(started)).autoForge).toEqual({
      endsAt: null,
      resourceType: "gold",
      resourceAmount: 0,
      capitalGoldOutput: 0,
      durationMs: 0,
    });
  });

  it("opens Auto Forge with the perk at Town Hall 7", () => {
    const base = village(7);
    expect(autoForgeOpen(base)).toBe(false);
    const dailies = dailiesOf(base);
    const perk = { ...base, dailies: { ...dailies, goldPass: { ...dailies.goldPass, autoForgeUnlocked: true } } };
    expect(autoForgeOpen(perk)).toBe(true);
    expect(autoForgeOpen({ ...perk, data: { ...perk.data, homeVillage: { ...perk.data.homeVillage, townHallLevel: 6 } } })).toBe(false);
  });
});

describe("Gold Pass", () => {
  const october = at("2026-10-20T09:00:00");
  const november = at("2026-11-02T09:00:00");

  it("writes the month key with a boost", () => {
    const boosted = setBoost(village(), "builder", 15, october);
    expect(dailiesOf(boosted).goldPass.monthKey).toBe("2026-10");
    expect(goldPassBoosts(boosted, october)).toEqual({ builder: 15, research: 0 });
  });

  it("keeps the other boost when one changes", () => {
    const both = setBoost(setBoost(village(), "builder", 15, october), "research", 20, october);
    expect(goldPassBoosts(both, october)).toEqual({ builder: 15, research: 20 });
  });

  it("reads last month's boosts as zero and offers them back", () => {
    const boosted = setBoost(village(), "builder", 20, october);
    expect(goldPassBoosts(boosted, november)).toEqual({ builder: 0, research: 0 });
    expect(rolledBoosts(boosted, november)).toEqual({ builder: 20, research: 0 });
    expect(rolledBoosts(boosted, october)).toBeNull();
    expect(goldPassBoosts(restoreRolledBoosts(boosted, november), november).builder).toBe(20);
    expect(rolledBoosts(acceptRollover(boosted, november), november)).toBeNull();
  });

  it("does not report a rollover for a month key that was never written", () => {
    expect(rolledBoosts(village(), november)).toBeNull();
  });
});

describe("Helpers", () => {
  const now = at("2026-10-20T09:00:00");
  const finishesAt = new Date(now.getTime() + 30 * HOUR).toISOString();

  const assigned = (mode: "once" | "continuous" = "once") => {
    let current = withRunningCannon(finishesAt);
    current = setHelperLevel(current, "buildersApprentice", 3);
    current = assignUpgrade(current, "buildersApprentice", cannon);
    return setAssignmentMode(current, "buildersApprentice", mode);
  };

  it("previews the time a use saves", () => {
    expect(previewHelperUse(assigned(), "buildersApprentice", now)).toEqual({
      savedMs: 3 * HOUR,
      remainingMs: 30 * HOUR,
      afterMs: 27 * HOUR,
    });
  });

  it("saves at most the time that is left", () => {
    const short = writeUpgrade(assigned(), cannon, {
      upgradeStartedAt: now.toISOString(),
      finishesAt: new Date(now.getTime() + HOUR).toISOString(),
      builderId: 1,
    });
    expect(previewHelperUse(short, "buildersApprentice", now)?.savedMs).toBe(HOUR);
  });

  it("shortens the upgrade, marks the timer used and clears a one time assignment", () => {
    const used = applyHelperUse(setResetTime2(assigned()), "buildersApprentice", now);
    expect(Date.parse(readUpgrade(used, cannon)!.finishesAt)).toBe(now.getTime() + 27 * HOUR);
    expect(dailiesOf(used).helpers.buildersApprentice.lastCollectedAt).toBe(now.toISOString());
    expect(readAssignment(used, "buildersApprentice")).toBeUndefined();
  });

  it("keeps an until done assignment after a use", () => {
    const used = applyHelperUse(setResetTime2(assigned("continuous")), "buildersApprentice", now);
    expect(readAssignment(used, "buildersApprentice")?.mode).toBe("continuous");
  });

  it("changes nothing on the upgrade without a level", () => {
    const noLevel = setHelperLevel(assigned(), "buildersApprentice", undefined);
    const used = applyHelperUse(noLevel, "buildersApprentice", now);
    expect(readUpgrade(used, cannon)!.finishesAt).toBe(finishesAt);
  });

  it("clears the assignment when the upgrade finishes or is cancelled", () => {
    expect(readAssignment(completeUpgrade(assigned(), cannon, now), "buildersApprentice")).toBeUndefined();
    expect(readAssignment(cancelUpgrade(assigned(), cannon), "buildersApprentice")).toBeUndefined();
  });

  it("reads no assignment once the upgrade is gone", () => {
    const gone = writeUpgrade(assigned(), cannon, undefined);
    expect(assignmentView(gone, "buildersApprentice", now)).toBeNull();
  });

  it("reads an older save that wrote the Town Hall as a defense", () => {
    const base = setHelperLevel(village(), "buildersApprentice", 1);
    const dailies = dailiesOf(base);
    const legacy = {
      ...base,
      dailies: {
        ...dailies,
        helpers: {
          ...dailies.helpers,
          buildersApprenticeAssignment: {
            target: { type: "building" as const, recordKey: "defenses" as const, buildingId: "town-hall", instanceIndex: 0 },
            mode: "once" as const,
          },
        },
      },
    };
    const upgrading = writeUpgrade(legacy, { kind: "townHall" }, { upgradeStartedAt: now.toISOString(), finishesAt, builderId: 1 });
    expect(assignmentView(upgrading, "buildersApprentice", now)?.target).toEqual({ kind: "townHall" });
  });

  it("converts with the Alchemist", () => {
    expect(alchemistOutput(1_500_000, "gold", "darkElixir", 5)).toBeGreaterThan(0);
    expect(alchemistOutput(100, "darkElixir", "gold", 1)).toBeGreaterThan(0);
    expect(alchemistOutput(100, "gold", "gold", 1)).toBe(0);
  });

  it("converts ore at 10 to 1 and 100 to 1", () => {
    expect(oreOutput(2000, "shiny", "glowy")).toBe(200);
    expect(oreOutput(200, "glowy", "starry")).toBe(2);
    expect(oreOutput(1, "starry", "shiny")).toBe(1000);
  });
});

const setResetTime2 = (current: Playthrough): Playthrough => ({
  ...current,
  dailies: setResetTime(dailiesOf(current), "buildersApprentice", "06:00"),
});
