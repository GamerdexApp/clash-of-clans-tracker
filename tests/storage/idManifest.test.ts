import { builder, clanCapital, home } from "clash-of-clans-data";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import manifest from "./idManifest.json";

const requireFile = createRequire(import.meta.url);

const ARMY_BUILDING_FILES = [
  "army-camp",
  "barracks",
  "dark-barracks",
  "spell-factory",
  "dark-spell-factory",
  "workshop",
  "laboratory",
  "hero-hall",
  "pet-house",
  "blacksmith",
];

const keysOf = (list: { id?: string; name: string }[]) =>
  list.map((entry) => entry.id ?? entry.name);
const namesOf = (list: { name: string }[]) => list.map((entry) => entry.name);

const expectAllPresent = (saved: string[], current: string[]) => {
  const missing = saved.filter((key) => !current.includes(key));
  expect(missing).toEqual([]);
};

// Saves hold these ids and names. A renamed or removed entry in the data package would orphan saved progress.
describe("ids that saves depend on", () => {
  const h = home();
  const b = builder();
  const c = clanCapital();

  it("finds every Home Village building id", () => {
    expectAllPresent(manifest.home.defenses, keysOf(h.defenses().get()));
    expectAllPresent(manifest.home.traps, keysOf(h.traps().get()));
    expectAllPresent(
      manifest.home.resourceBuildings,
      keysOf(h.resourceBuildings().get()),
    );
    expectAllPresent(manifest.home.guardians, keysOf(h.guardians().get()));
    expectAllPresent(
      manifest.home.craftedDefenses,
      keysOf(h.craftedDefenses().current().get()),
    );
  });

  it("finds every Home Village army building file", () => {
    for (const file of ARMY_BUILDING_FILES) {
      expect(() =>
        requireFile(
          `clash-of-clans-data/data/home/army-buildings/${file}.json`,
        ),
      ).not.toThrow();
    }
  });

  it("finds every troop, spell, siege machine, pet and hero name", () => {
    expectAllPresent(manifest.home.troops, namesOf(h.troops().get()));
    expectAllPresent(manifest.home.spells, namesOf(h.spells().get()));
    expectAllPresent(
      manifest.home.siegeMachines,
      namesOf(h.siegeMachines().get()),
    );
    expectAllPresent(manifest.home.pets, namesOf(h.pets().get()));
    expectAllPresent(manifest.home.heroes, namesOf(h.heroes().get()));
  });

  it("finds every Builder Base and Clan Capital name", () => {
    expectAllPresent(manifest.builder.troops, namesOf(b.troops().get()));
    expectAllPresent(manifest.builder.heroes, namesOf(b.heroes().get()));
    expectAllPresent(manifest.clanCapital.troops, namesOf(c.troops().get()));
    expectAllPresent(manifest.clanCapital.spells, namesOf(c.spells().get()));
  });
});
