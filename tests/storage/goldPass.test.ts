import { describe, expect, it } from "vitest";

import { goldPassBoosts, monthKeyFor } from "@/service/goldPass";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const withGoldPass = (monthKey: string): Playthrough => ({
  ...freshVillage("v", "V"),
  dailies: {
    goldPass: { builderBoostPct: 20, researchBoostPct: 10, monthKey },
  } as Playthrough["dailies"],
});

describe("goldPassBoosts", () => {
  const now = new Date(2026, 2, 15);

  it("builds the month key from the local date", () => {
    expect(monthKeyFor(now)).toBe("2026-03");
  });

  it("returns the chosen boosts in the same month", () => {
    expect(goldPassBoosts(withGoldPass("2026-03"), now)).toEqual({ builder: 20, research: 10 });
  });

  it("reads an earlier month as no boost without changing the village", () => {
    const village = withGoldPass("2026-02");
    expect(goldPassBoosts(village, now)).toEqual({ builder: 0, research: 0 });
    expect(village.dailies?.goldPass.builderBoostPct).toBe(20);
  });

  it("reads a village with no dailies as no boost", () => {
    expect(goldPassBoosts(freshVillage("v", "V"), now)).toEqual({ builder: 0, research: 0 });
  });
});
