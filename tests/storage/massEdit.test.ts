import { describe, expect, it } from "vitest";

import {
  allRows,
  applyBulk,
  applyChanges,
  categoryProgress,
  changedRows,
  homeCategories,
  lowers,
  planBulk,
  readRow,
  rowMax,
  writeRow,
} from "@/service/massEdit";
import { writeUpgrade } from "@/service/upgradeEngine";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const NOW = new Date("2026-10-20T09:00:00Z");

const villageAt = (townHall: number): Playthrough => {
  const village = structuredClone(freshVillage("v", "V"));
  village.data.homeVillage.townHallLevel = townHall;
  return village;
};

const category = (village: Playthrough, id: string) => homeCategories(village).find((candidate) => candidate.id === id)!;

describe("Mass edit home categories", () => {
  it("lists the thirteen categories in order", () => {
    expect(homeCategories(villageAt(12)).map((entry) => entry.id)).toEqual([
      "defenses", "army", "resources", "crafted", "traps", "troops", "spells", "siege", "pets", "guardians", "heroes", "equipment", "walls",
    ]);
  });

  it("keeps locked categories with a requirement", () => {
    const village = villageAt(12);
    expect(category(village, "crafted").requirement).toBe("Town Hall 18");
    expect(category(village, "pets").requirement).toBe("Town Hall 14");
    expect(category(villageAt(18), "crafted").requirement).toBeUndefined();
  });

  it("gives every instance its own numbered row", () => {
    const rows = category(villageAt(12), "defenses").rows;
    expect(rows.some((row) => row.label === "Cannon #1")).toBe(true);
    expect(rows.every((row) => row.max > 0)).toBe(true);
  });

  it("splits Army into army buildings and other buildings", () => {
    const sections = new Set(category(villageAt(12), "army").rows.map((row) => row.section));
    expect(sections).toEqual(new Set(["Army buildings", "Other buildings"]));
  });
});

describe("Mass edit draft", () => {
  it("writes a level and reports the change", () => {
    const saved = villageAt(12);
    const row = category(saved, "heroes").rows[0];
    const draft = writeRow(saved, row.ref, 10, NOW);
    expect(readRow(draft, row.ref)).toBe(10);
    expect(changedRows(allRows(homeCategories(saved)), saved, draft)).toEqual([{ row, from: 0, to: 10 }]);
  });

  it("applies the changes of a draft onto a newer saved village", () => {
    const saved = villageAt(12);
    const row = category(saved, "troops").rows[0];
    const draft = writeRow(saved, row.ref, 5, NOW);
    const latest = writeRow(saved, category(saved, "spells").rows[0].ref, 3, NOW);
    const merged = applyChanges(latest, changedRows(allRows(homeCategories(saved)), saved, draft), NOW);
    expect(readRow(merged, row.ref)).toBe(5);
    expect(readRow(merged, category(saved, "spells").rows[0].ref)).toBe(3);
  });

  it("creates the equipment entry on the first edit of a fresh village", () => {
    const saved = villageAt(12);
    const row = category(saved, "equipment").rows[0];
    expect(readRow(saved, row.ref)).toBe(0);
    expect(readRow(writeRow(saved, row.ref, 3, NOW), row.ref)).toBe(3);
  });

  it("blocks a crafted module while its timer runs", () => {
    const saved = villageAt(18);
    const row = category(saved, "crafted").rows[0];
    expect(row.blocked).toBeUndefined();
    const running = writeUpgrade(saved, row.ref.kind === "upgrade" ? row.ref.target : { kind: "townHall" }, {
      upgradeStartedAt: NOW.toISOString(),
      finishesAt: new Date(NOW.getTime() + 3600_000).toISOString(),
      builderId: 1,
    });
    expect(category(running, "crafted").rows[0].blocked).toBe("Timer running");
    expect(planBulk(running, category(running, "crafted").rows, { kind: "max" }).map((change) => change.row.key)).not.toContain(row.key);
  });

  it("clamps a wall count to the walls left", () => {
    const saved = villageAt(12);
    const wall = category(saved, "walls").rows[0];
    const draft = writeRow(saved, wall.ref, 100_000, NOW);
    expect(readRow(draft, wall.ref)).toBe(rowMax(saved, wall));
  });
});

describe("Mass edit bulk actions", () => {
  it("raises every row to its maximum and counts it", () => {
    const saved = villageAt(12);
    const heroes = category(saved, "heroes");
    const changes = planBulk(saved, heroes.rows, { kind: "max" });
    expect(lowers(changes)).toEqual([]);
    const draft = applyBulk(saved, changes, NOW);
    expect(categoryProgress(draft, category(draft, "heroes"))).toEqual({ done: heroes.rows.length, total: heroes.rows.length });
  });

  it("sets a level for rows and stops at each row's maximum", () => {
    const saved = villageAt(12);
    const rows = category(saved, "troops").rows.slice(0, 3);
    const changes = planBulk(saved, rows, { kind: "level", level: 999 });
    expect(changes.map((change) => change.to)).toEqual(rows.map((row) => row.max));
  });

  it("lists what Reset All lowers", () => {
    const saved = planAndApplyMax(villageAt(12), "spells");
    const changes = planBulk(saved, category(saved, "spells").rows, { kind: "reset" });
    expect(lowers(changes)).toHaveLength(changes.length);
    expect(changes.length).toBeGreaterThan(0);
  });

  it("lowers rows above a lower Town Hall and clears rows it does not have", () => {
    const saved = planAndApplyMax(villageAt(12), "defenses");
    const lowerHall = homeCategories(saved, 9);
    const changes = planBulk(saved, category(saved, "defenses").rows, { kind: "hall", categories: lowerHall });
    expect(lowers(changes).length).toBeGreaterThan(0);
    expect(changes.every((change) => change.to <= change.from)).toBe(true);
  });

  it("resets the Supercharge tier when a building drops below its top normal level", () => {
    const saved = villageAt(18);
    const rows = category(saved, "defenses").rows;
    const row = rows.find((candidate) => candidate.supercharge)!;
    const supercharged = writeRow(writeRow(saved, row.ref, row.max, NOW), row.supercharge!.row.ref, 1, NOW);
    expect(readRow(supercharged, row.supercharge!.row.ref)).toBe(1);
    const lowered = writeRow(supercharged, row.ref, row.max - 1, NOW);
    expect(readRow(lowered, row.supercharge!.row.ref)).toBe(0);
  });
});

const planAndApplyMax = (village: Playthrough, id: string) =>
  applyBulk(village, planBulk(village, category(village, id).rows, { kind: "max" }), NOW);
