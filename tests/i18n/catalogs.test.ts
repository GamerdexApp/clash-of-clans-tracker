import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { SUPPORTED_LOCALES } from "@/i18n/locales";

const MESSAGES = "src/i18n/messages";

const languageFolders = () =>
  readdirSync(MESSAGES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "en")
    .map((entry) => entry.name)
    .sort();

describe("language catalogs", () => {
  it("has English and no folder for an unknown language", () => {
    const folders = readdirSync(MESSAGES, { withFileTypes: true }).filter((entry) => entry.isDirectory());
    expect(folders.map((entry) => entry.name)).toContain("en");
    for (const code of languageFolders()) expect(SUPPORTED_LOCALES).toContain(code);
  });

  it("has a catalog folder for every supported language", () => {
    const expected = SUPPORTED_LOCALES.filter((code) => code !== "en").sort();
    expect(languageFolders()).toEqual(expected);
  });

  it("gives every language folder every English message with the same variables, tags and plurals", () => {
    // The script exits with 1 and prints the problems when any catalog differs from English.
    const output = execFileSync("node", ["scripts/check-catalogs.mjs"], { encoding: "utf8" });
    for (const code of languageFolders()) {
      expect(output).toMatch(new RegExp(`^${code}: \\d+ of \\d+ messages, 0 missing, 0 problems$`, "m"));
    }
  });
});
