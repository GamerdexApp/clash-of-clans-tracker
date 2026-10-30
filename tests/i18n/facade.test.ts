import en from "@/i18n/messages/en";
import { describe, expect, it } from "vitest";

const files = import.meta.glob("../../src/lib/messages/*.ts", {
  eager: true,
}) as Record<string, Record<string, unknown>>;

const facades: Record<string, unknown> = {};
for (const file of Object.values(files)) {
  for (const [name, value] of Object.entries(file))
    facades[name.replace(/Text$/, "")] = value;
}

const leaves = (value: unknown, path: string[] = []): string[][] =>
  typeof value === "string"
    ? [path]
    : Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
        leaves(item, [...path, key]),
      );

const text = facades as Record<string, any>;

const SAMPLE_ARGS = [2, 3, 4, 5, 6, 7];

describe("the message objects", () => {
  it("has a facade for every English namespace except the Language and region card", () => {
    const namespaces = Object.keys(en).filter((key) => key !== "settings");
    for (const namespace of namespaces)
      expect(facades[namespace], namespace).toBeDefined();
  });

  it("resolves every English message to text, with every variable filled", () => {
    for (const [namespace, catalog] of Object.entries(en)) {
      const root = facades[namespace];
      if (!root) continue;
      for (const path of leaves(catalog)) {
        if (namespace === "settings" && path[0] === "region") continue;
        let node: unknown = root;
        for (const step of path) {
          node = Array.isArray(node)
            ? node[Number(step.slice(4)) - 1]
            : (node as Record<string, unknown>)[step];
        }
        const text =
          typeof node === "function"
            ? (node as (...args: unknown[]) => string)(...SAMPLE_ARGS)
            : node;
        const where = `${namespace}.${path.join(".")}`;
        expect(typeof text, where).toBe("string");
        expect(text, where).not.toBe(where.split(".").slice(1).join("."));
        expect(String(text), where).not.toMatch(/[{}]/);
      }
    }
  });

  it("formats numbers, plurals and lists the way the old functions did", () => {
    expect(text.sync.villageCount(1, "1")).toBe("1 village");
    expect(text.sync.villageCount(3, "3")).toBe("3 villages");
    expect(text.walls.tiles.stillToPlace(1)).toBe("1 wall still to place");
    expect(text.walls.tiles.stillToPlace(12)).toBe("12 walls still to place");
    expect(text.overview.builder.trophies(3412)).toBe("3,412 trophies");
    expect(
      text.capital.hall.nextCost(8, "600,000", ["Skeleton Park"]),
    ).toContain("and opens Skeleton Park");
    expect(text.capital.hall.nextCost(8, "600,000", [])).not.toContain("opens");
    expect(text.dailies.helpers.nextLevel(1, "0")).toBe("Level 1 is free");
    expect(text.dailies.helpers.nextLevel(5, "1,000")).toBe(
      "Level 5 costs 1,000 gems",
    );
    expect(text.villages.lookup.found("Pezz", 12, 8, 50, 20)).toContain(
      "Town Hall 12, Builder Hall 8.",
    );
    expect(text.villages.lookup.found("Pezz", 12, 0, 50, 20)).toBe(
      "Pezz, Town Hall 12. 50 achievements and 20 troops read.",
    );
    expect(text.overview.header.clanLevel(8, "coLeader")).toBe(
      "Clan level 8, coLeader",
    );
    expect(text.overview.header.clanLevel(8, "")).toBe("Clan level 8");
    expect(text.overview.home.tile("Cannon", 5, 17, undefined)).toBe(
      "Cannon, level 5 of 17",
    );
    expect(text.overview.home.tile("Pets", 0, 0, "Town Hall 14")).toBe(
      "Pets, requires Town Hall 14",
    );
    expect(text.landing.faq.items).toHaveLength(5);
    expect(text.landing.faq.items[0].question).toBeTruthy();
    expect(text.sync.how.points).toHaveLength(6);
  });
});

describe("durations", () => {
  it("keeps the English shapes the pages used before", async () => {
    const { formatCountdown, formatDuration, formatTimeLeft } =
      await import("@/lib/format");
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(((24 + 14) * 60 + 20) * 60_000)).toBe("1d 14h 20m");
    expect(formatCountdown(((2 * 24 + 5) * 3600 + 120) * 1000)).toBe("2d 5h");
    expect(formatCountdown(125_000)).toBe("2m 05s");
    expect(formatTimeLeft((15 * 60 + 42) * 60_000 + 8_000)).toBe("15h 42m 08s");
  });
});
