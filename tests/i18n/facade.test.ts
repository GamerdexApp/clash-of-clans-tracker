import { describe, expect, it } from "vitest";

import en from "@/i18n/messages/en";
import * as achievements from "@/lib/messages/achievements";
import * as builder from "@/lib/messages/builder";
import * as builderBase from "@/lib/messages/builderBase";
import * as capital from "@/lib/messages/capital";
import * as dailies from "@/lib/messages/dailies";
import * as equipment from "@/lib/messages/equipment";
import * as landing from "@/lib/messages/landing";
import * as massEdit from "@/lib/messages/massEdit";
import * as overview from "@/lib/messages/overview";
import * as pets from "@/lib/messages/pets";
import * as queue from "@/lib/messages/queue";
import * as research from "@/lib/messages/research";
import * as settings from "@/lib/messages/settings";
import * as shell from "@/lib/messages/shell";
import * as sync from "@/lib/messages/sync";
import * as ui from "@/lib/messages/ui";
import * as upgrades from "@/lib/messages/upgrades";
import * as villages from "@/lib/messages/villages";
import * as walls from "@/lib/messages/walls";

const facades: Record<string, unknown> = {};
for (const file of [achievements, builder, builderBase, capital, dailies, equipment, landing, massEdit, overview, pets, queue, research, settings, shell, sync, ui, upgrades, villages, walls]) {
  for (const [name, value] of Object.entries(file)) facades[name.replace(/Text$/, "")] = value;
}

const leaves = (value: unknown, path: string[] = []): string[][] =>
  typeof value === "string" ? [path] : Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => leaves(item, [...path, key]));

const SAMPLE_ARGS = [2, 3, 4, 5, 6, 7];

describe("the message objects", () => {
  it("has a facade for every English namespace except the Language and region card", () => {
    const namespaces = Object.keys(en).filter((key) => key !== "settings");
    for (const namespace of namespaces) expect(facades[namespace], namespace).toBeDefined();
  });

  it("resolves every English message to text, with every variable filled", () => {
    for (const [namespace, catalog] of Object.entries(en)) {
      const root = facades[namespace];
      if (!root) continue;
      for (const path of leaves(catalog)) {
        if (namespace === "settings" && path[0] === "region") continue;
        let node: unknown = root;
        for (const step of path) {
          node = Array.isArray(node) ? node[Number(step.slice(4)) - 1] : (node as Record<string, unknown>)[step];
        }
        const text = typeof node === "function" ? (node as (...args: unknown[]) => string)(...SAMPLE_ARGS) : node;
        const where = `${namespace}.${path.join(".")}`;
        expect(typeof text, where).toBe("string");
        expect(text, where).not.toBe(where.split(".").slice(1).join("."));
        expect(String(text), where).not.toMatch(/[{}]/);
      }
    }
  });

  it("formats numbers, plurals and lists the way the old functions did", () => {
    expect(sync.syncText.villageCount(1, "1")).toBe("1 village");
    expect(sync.syncText.villageCount(3, "3")).toBe("3 villages");
    expect(walls.wallsText.tiles.stillToPlace(1)).toBe("1 wall still to place");
    expect(walls.wallsText.tiles.stillToPlace(12)).toBe("12 walls still to place");
    expect(overview.overviewText.builder.trophies(3412)).toBe("3,412 trophies");
    expect(capital.capitalText.hall.nextCost(8, "600,000", ["Skeleton Park"])).toContain("and opens Skeleton Park");
    expect(capital.capitalText.hall.nextCost(8, "600,000", [])).not.toContain("opens");
    expect(dailies.dailiesText.helpers.nextLevel(1, "0")).toBe("Level 1 is free");
    expect(dailies.dailiesText.helpers.nextLevel(5, "1,000")).toBe("Level 5 costs 1,000 gems");
    expect(landing.landingText.faq.items).toHaveLength(5);
    expect(landing.landingText.faq.items[0].question).toBeTruthy();
    expect(sync.syncText.how.points).toHaveLength(6);
  });
});
