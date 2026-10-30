import { describe, expect, it } from "vitest";
import { hasLegacyKeys, uiFromLegacyKeys } from "@/lib/services/legacyKeys";

const storageOf = (values: Record<string, string>) => ({
  getItem: (key: string) => values[key] ?? null,
});

describe("legacy local storage keys", () => {
  it("turns Hide Max on when any old flag was on", () => {
    const storage = storageOf({
      "upgrade:builder:hideMax": "false",
      "upgrade:pets:hideMax": "true",
    });
    expect(uiFromLegacyKeys(storage).hideMax).toBe(true);
  });

  it("leaves Hide Max unset when every old flag was off", () => {
    expect(
      uiFromLegacyKeys(storageOf({ "upgrade:builder:hideMax": "false" }))
        .hideMax,
    ).toBeUndefined();
  });

  it("keeps a value that is already in settings", () => {
    const storage = storageOf({
      "upgrade:builder:hideMax": "true",
      "queue:builder:hiddenCategories": '["walls"]',
    });
    const ui = uiFromLegacyKeys(storage, {
      hideMax: false,
      hiddenCategories: { builder: ["traps"] },
    });
    expect(ui.hideMax).toBe(false);
    expect(ui.hiddenCategories?.builder).toEqual(["traps"]);
  });

  it("moves hidden categories and keeps the other ui fields", () => {
    const storage = storageOf({
      "queue:research:hiddenCategories": '["troops","spells"]',
    });
    expect(uiFromLegacyKeys(storage, { builderTab: "defenses" })).toEqual({
      builderTab: "defenses",
      hiddenCategories: { research: ["troops", "spells"] },
    });
  });

  it("ignores a damaged category value", () => {
    expect(
      uiFromLegacyKeys(
        storageOf({ "queue:builder:hiddenCategories": "{oops" }),
      ),
    ).toEqual({});
  });

  it("detects whether any old key exists", () => {
    expect(hasLegacyKeys(storageOf({}))).toBe(false);
    expect(
      hasLegacyKeys(storageOf({ "queue:builder:hiddenCategories": "[]" })),
    ).toBe(true);
  });
});
