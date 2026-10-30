import { type FirstSyncChoice, MemoryProvider, sync, type SyncResult, type SyncState } from "@gamerdexapp/gamerdex-sync";
import { describe, expect, it } from "vitest";

import { isSyncDocument } from "@/lib/sync/document";
import { syncSchema } from "@/lib/sync/schema";
import { fromSyncShape, toSyncShape } from "@/lib/sync/shape";
import type { AppData, Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const APP_ID = "clash-of-clans-tracker";

const populated = (id: string, name: string): Playthrough => {
  const village = structuredClone(freshVillage(id, name));
  village.data.homeVillage.defenses = { cannon: [{ level: 5 }, { level: 3 }, { level: 0 }] };
  village.data.homeVillage.heroes = [{ name: "Barbarian King", level: 10, equipment: [{ name: "Rage Vial", level: 4 }] }];
  village.data.homeVillage.craftedDefenses = { roaster: { modules: [1, 2, 3] } };
  village.data.clanCapital.capitalPeak.hallLevel = 4;
  village.data.clanCapital.capitalPeak.buildings = { "capital-hall": [2, 1] };
  village.data.achievements = [
    { name: "Gold Grab", village: "home", stars: 1, value: 100, target: 200 },
    { name: "Gold Grab", village: "builderBase", stars: 0, value: 0, target: 10 },
  ];
  return village;
};

class Device {
  state: SyncState | null = null;
  constructor(
    readonly id: string,
    public playthroughs: Playthrough[],
    public activePlaythroughId: string | null = playthroughs[0]?.id ?? null,
  ) {}

  document(): AppData {
    // Saved data always passes through JSON, which drops undefined fields.
    return JSON.parse(JSON.stringify({ playthroughs: this.playthroughs, activePlaythroughId: this.activePlaythroughId }));
  }

  async sync(cloud: MemoryProvider, firstSync?: FirstSyncChoice): Promise<SyncResult> {
    const result = await sync({
      appId: APP_ID,
      deviceId: this.id,
      deviceName: this.id,
      provider: cloud,
      schema: syncSchema,
      local: toSyncShape(this.document()),
      state: this.state,
      firstSync,
      validate: isSyncDocument,
      now: () => "2026-01-02T00:00:00.000Z",
    });
    if (result.status === "synced") {
      this.playthroughs = fromSyncShape(result.data).playthroughs;
      this.state = structuredClone(result.state);
    }
    return result;
  }

  get(id: string) {
    return this.playthroughs.find((village) => village.id === id)!;
  }
}

const synced = async (result: Promise<SyncResult>) => {
  const outcome = await result;
  if (outcome.status !== "synced") throw new Error("expected a finished sync");
  return outcome;
};

const twoDevices = async () => {
  const cloud = new MemoryProvider();
  const a = new Device("a", [populated("v1", "Main")]);
  await a.sync(cloud);
  const b = new Device("b", []);
  await synced(b.sync(cloud, "keep-cloud"));
  return { cloud, a, b };
};

describe("The sync shape", () => {
  it("round trips the saved data without losing anything", () => {
    const document: AppData = { playthroughs: [populated("v1", "Main")], activePlaythroughId: "v1" };
    expect(fromSyncShape(toSyncShape(document))).toEqual(document);
  });

  it("turns lists into objects the merge can read per position", () => {
    const shape = toSyncShape({ playthroughs: [populated("v1", "Main")], activePlaythroughId: null }) as {
      playthroughs: Array<{ data: { homeVillage: { defenses: { cannon: Record<string, unknown> } }; achievements: Record<string, unknown> } }>;
    };
    expect(Object.keys(shape.playthroughs[0].data.homeVillage.defenses.cannon)).toEqual(["0", "1", "2"]);
    expect(Object.keys(shape.playthroughs[0].data.achievements)).toEqual(["home::Gold Grab", "builderBase::Gold Grab"]);
  });

  it("accepts a whole document and refuses a broken one", () => {
    expect(isSyncDocument(toSyncShape({ playthroughs: [populated("v1", "Main")], activePlaythroughId: null }))).toBe(true);
    expect(isSyncDocument({ playthroughs: "no" })).toBe(false);
  });
});

describe("Sync between two devices", () => {
  it("copies the villages to a second device", async () => {
    const { b } = await twoDevices();
    expect(b.get("v1").data.homeVillage.defenses.cannon).toEqual([{ level: 5 }, { level: 3 }, { level: 0 }]);
  });

  it("keeps the changes of two devices that edited different building instances", async () => {
    const { cloud, a, b } = await twoDevices();
    a.get("v1").data.homeVillage.defenses.cannon[0].level = 6;
    b.get("v1").data.homeVillage.defenses.cannon[1].level = 4;
    await synced(a.sync(cloud));
    await synced(b.sync(cloud));
    await synced(a.sync(cloud));
    for (const device of [a, b]) expect(device.get("v1").data.homeVillage.defenses.cannon.map((entry) => entry.level)).toEqual([6, 4, 0]);
  });

  it("takes the higher level when both devices raised the same instance", async () => {
    const { cloud, a, b } = await twoDevices();
    a.get("v1").data.homeVillage.defenses.cannon[0].level = 7;
    b.get("v1").data.homeVillage.defenses.cannon[0].level = 9;
    await synced(a.sync(cloud));
    const result = await synced(b.sync(cloud));
    expect(result.conflicts).toEqual([]);
    expect(b.get("v1").data.homeVillage.defenses.cannon[0].level).toBe(9);
  });

  it("carries a reset to the other device when it did not change that level", async () => {
    const { cloud, a, b } = await twoDevices();
    a.get("v1").data.homeVillage.defenses.cannon[0].level = 0;
    await synced(a.sync(cloud));
    await synced(b.sync(cloud));
    expect(b.get("v1").data.homeVillage.defenses.cannon[0].level).toBe(0);
  });

  it("adds a building instance that only one device has", async () => {
    const { cloud, a, b } = await twoDevices();
    a.get("v1").data.homeVillage.defenses.cannon.push({ level: 2 });
    await synced(a.sync(cloud));
    await synced(b.sync(cloud));
    expect(b.get("v1").data.homeVillage.defenses.cannon).toHaveLength(4);
  });

  it("reports a conflict when two devices started different upgrades on one instance", async () => {
    const { cloud, a, b } = await twoDevices();
    a.get("v1").data.homeVillage.defenses.cannon[2].upgrade = { upgradeStartedAt: "2026-01-02T08:00:00.000Z", finishesAt: "2026-01-03T08:00:00.000Z", builderId: 1 };
    b.get("v1").data.homeVillage.defenses.cannon[2].upgrade = { upgradeStartedAt: "2026-01-02T09:00:00.000Z", finishesAt: "2026-01-03T09:00:00.000Z", builderId: 2 };
    await synced(a.sync(cloud));
    const result = await synced(b.sync(cloud));
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].path.join(".")).toContain("upgrade");
  });

  it("merges heroes and their equipment by name", async () => {
    const { cloud, a, b } = await twoDevices();
    a.get("v1").data.homeVillage.heroes[0].level = 12;
    b.get("v1").data.homeVillage.heroes[0].equipment[0].level = 6;
    await synced(a.sync(cloud));
    await synced(b.sync(cloud));
    expect(b.get("v1").data.homeVillage.heroes[0].level).toBe(12);
    expect(b.get("v1").data.homeVillage.heroes[0].equipment[0].level).toBe(6);
  });

  it("merges crafted modules and Clan Capital building levels per position", async () => {
    const { cloud, a, b } = await twoDevices();
    a.get("v1").data.homeVillage.craftedDefenses.roaster.modules[0] = 5;
    b.get("v1").data.homeVillage.craftedDefenses.roaster.modules[2] = 7;
    a.get("v1").data.clanCapital.capitalPeak.buildings["capital-hall"][0] = 3;
    b.get("v1").data.clanCapital.capitalPeak.buildings["capital-hall"][1] = 2;
    await synced(a.sync(cloud));
    await synced(b.sync(cloud));
    expect(b.get("v1").data.homeVillage.craftedDefenses.roaster.modules).toEqual([5, 2, 7]);
    expect(b.get("v1").data.clanCapital.capitalPeak.buildings["capital-hall"]).toEqual([3, 2]);
  });

  it("merges achievements by name and village part", async () => {
    const { cloud, a, b } = await twoDevices();
    a.get("v1").data.achievements[0].stars = 2;
    b.get("v1").data.achievements[1].stars = 1;
    await synced(a.sync(cloud));
    await synced(b.sync(cloud));
    const stars = b.get("v1").data.achievements.map((entry) => `${entry.village}:${entry.stars}`).sort();
    expect(stars).toEqual(["builderBase:1", "home:2"]);
  });

  it("takes the later use of a daily timer", async () => {
    const { cloud, a, b } = await twoDevices();
    a.get("v1").dailies = { ...(a.get("v1").dailies ?? ({} as never)), starBonus: { resetTime: "06:00", lastCollectedAt: "2026-01-02T07:00:00.000Z" } } as never;
    await synced(a.sync(cloud));
    await synced(b.sync(cloud));
    expect(b.get("v1").dailies?.starBonus.lastCollectedAt).toBe("2026-01-02T07:00:00.000Z");
  });

  it("reports a conflict when both devices renamed the village", async () => {
    const { cloud, a, b } = await twoDevices();
    a.get("v1").name = "Alpha";
    b.get("v1").name = "Beta";
    await synced(a.sync(cloud));
    const result = await synced(b.sync(cloud));
    expect(result.conflicts.map((conflict) => conflict.path.join("."))).toContain("playthroughs.v1.name");
  });

  it("never changes the active village of a device", async () => {
    const { cloud, a, b } = await twoDevices();
    b.activePlaythroughId = "v1";
    a.activePlaythroughId = null;
    a.get("v1").name = "Renamed";
    await synced(a.sync(cloud));
    await synced(b.sync(cloud));
    expect(b.activePlaythroughId).toBe("v1");
    expect(a.activePlaythroughId).toBeNull();
  });

  it("deletes a village on the other device when nothing there changed it", async () => {
    const { cloud, a, b } = await twoDevices();
    a.playthroughs = [];
    await synced(a.sync(cloud));
    await synced(b.sync(cloud));
    expect(b.playthroughs).toEqual([]);
  });

  it("keeps a village that one device deleted and the other edited, and reports it", async () => {
    const { cloud, a, b } = await twoDevices();
    a.playthroughs = [];
    b.get("v1").data.homeVillage.defenses.cannon[0].level = 8;
    await synced(a.sync(cloud));
    const result = await synced(b.sync(cloud));
    expect(b.playthroughs).toHaveLength(1);
    expect(result.conflicts.map((conflict) => conflict.kind)).toContain("delete-edit");
  });

  it("asks before replacing anything on a first sync when both sides have data", async () => {
    const cloud = new MemoryProvider();
    await new Device("a", [populated("v1", "Main")]).sync(cloud);
    const result = await new Device("b", [populated("v2", "Other")]).sync(cloud);
    expect(result.status).toBe("needs-choice");
  });
});
