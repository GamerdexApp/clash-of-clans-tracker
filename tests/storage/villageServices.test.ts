import { describe, expect, it } from "vitest";

import { normalizePlayerTag } from "@/service/playerTag";
import { refreshFromPlayerApi } from "@/service/playerRefresh";
import { daysSince, filterAndSort, nextActiveAfterDelete } from "@/service/villageList";
import type { VillageData } from "@/types/app/game";

import { freshVillage } from "./fixtures";

describe("normalizePlayerTag", () => {
  it("trims, uppercases, swaps O for 0 and adds the hash", () => {
    expect(normalizePlayerTag("  ppv2yo9r ")).toBe("#PPV2Y09R");
    expect(normalizePlayerTag("##abc")).toBe("#ABC");
    expect(normalizePlayerTag("   ")).toBe("");
  });
});

describe("village list", () => {
  const a = { ...freshVillage("a", "Alpha"), lastModified: "2026-01-01T00:00:00.000Z", createdAt: "2026-03-01T00:00:00.000Z" };
  const b = { ...freshVillage("b", "beta"), lastModified: "2026-02-01T00:00:00.000Z", createdAt: "2026-01-01T00:00:00.000Z" };

  it("searches by name and sorts", () => {
    expect(filterAndSort([a, b], "ET", "name").map((v) => v.id)).toEqual(["b"]);
    expect(filterAndSort([a, b], "", "lastModified").map((v) => v.id)).toEqual(["b", "a"]);
    expect(filterAndSort([a, b], "", "createdAt").map((v) => v.id)).toEqual(["a", "b"]);
  });

  it("names the village that becomes active after a delete", () => {
    expect(nextActiveAfterDelete([a, b], "b")?.id).toBe("a");
    expect(nextActiveAfterDelete([a], "a")).toBeNull();
  });

  it("counts whole days and returns null for a missing date", () => {
    expect(daysSince("2026-01-01T00:00:00.000Z", new Date("2026-01-11T12:00:00.000Z"))).toBe(10);
    expect(daysSince(undefined)).toBeNull();
  });
});

describe("refreshFromPlayerApi", () => {
  const existing = freshVillage("v", "V").data;
  existing.homeVillage.townHallLevel = 12;
  existing.homeVillage.troops[0] = { ...existing.homeVillage.troops[0], level: 3 };
  existing.homeVillage.armyBuildings = { blacksmith: [{ level: 4 }] };
  existing.homeVillage.builderQueues = { 1: [] } as never;
  existing.clanCapital.capitalPeak = { hallLevel: 5, buildings: {} };
  existing.clanCapital.troops[0] = { ...existing.clanCapital.troops[0], level: 2 };
  existing.achievements = [{ name: "Local only", stars: 1, value: 1, target: 2, village: "home" }];

  const api: VillageData = structuredClone(existing);
  api.homeVillage.townHallLevel = 13;
  api.homeVillage.troops = [{ name: existing.homeVillage.troops[0].name, level: 5 }];
  api.homeVillage.armyBuildings = {};
  api.clanCapital.clanCapitalContributions = 900;
  api.clanCapital.capitalPeak = { hallLevel: 0, buildings: {} };
  api.achievements = [{ name: "From API", stars: 2, value: 5, target: 9, village: "home" }];

  const result = refreshFromPlayerApi(existing, api);

  it("updates API fields and reports a Town Hall change", () => {
    expect(result.data.homeVillage.townHallLevel).toBe(13);
    expect(result.data.homeVillage.troops[0].level).toBe(5);
    expect(result.data.clanCapital.clanCapitalContributions).toBe(900);
    expect(result.townHallChanged).toBe(true);
    expect(result.builderHallChanged).toBe(false);
  });

  it("keeps troops, buildings, queues and Clan Capital data the API omits", () => {
    expect(result.data.homeVillage.troops.length).toBe(existing.homeVillage.troops.length);
    expect(result.data.homeVillage.armyBuildings).toEqual({ blacksmith: [{ level: 4 }] });
    expect(result.data.homeVillage.builderQueues).toEqual(existing.homeVillage.builderQueues);
    expect(result.data.clanCapital.capitalPeak.hallLevel).toBe(5);
    expect(result.data.clanCapital.troops[0].level).toBe(2);
  });

  it("keeps achievements the response lacks", () => {
    expect(result.data.achievements.map((a) => a.name).sort()).toEqual(["From API", "Local only"]);
  });

  it("keeps a running upgrade only when the level did not change", () => {
    const upgrade = { upgradeStartedAt: "a", finishesAt: "b", builderId: 1 };
    const running = structuredClone(existing);
    running.homeVillage.troops[0] = { ...running.homeVillage.troops[0], level: 5, upgrade };
    expect(refreshFromPlayerApi(running, api).data.homeVillage.troops[0].upgrade).toEqual(upgrade);
    expect(refreshFromPlayerApi(existing, api).data.homeVillage.troops[0].upgrade).toBeUndefined();
  });
});
