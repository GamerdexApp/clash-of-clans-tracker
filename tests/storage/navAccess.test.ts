import { describe, expect, it } from "vitest";

import { clanCapitalState, lockedRequirement } from "@/service/navAccess";
import type { Playthrough } from "@/types/app";

import { freshVillage } from "./fixtures";

const village = (townHall: number, patch: Partial<Playthrough> = {}): Playthrough => {
  const base = freshVillage("v", "V");
  return {
    ...base,
    ...patch,
    data: {
      ...base.data,
      homeVillage: { ...base.data.homeVillage, townHallLevel: townHall },
    },
  };
};

describe("sidebar locks", () => {
  it("locks Pets below Town Hall 14", () => {
    expect(lockedRequirement("pets", village(13))).toBe("Town Hall 14");
    expect(lockedRequirement("pets", village(14))).toBeNull();
  });

  it("locks Forge at 6 and Season Pass at 7", () => {
    expect(lockedRequirement("forge", village(5))).toBe("Town Hall 6");
    expect(lockedRequirement("forge", village(6))).toBeNull();
    expect(lockedRequirement("seasonPass", village(6))).toBe("Town Hall 7");
    expect(lockedRequirement("seasonPass", village(7))).toBeNull();
  });

  it("opens Equipment and Helpers once the building exists", () => {
    const built = village(10);
    built.data.homeVillage.armyBuildings = {
      blacksmith: [{ level: 1 }],
      "helper-hut": [{ level: 1 }],
    };
    expect(lockedRequirement("equipment", village(10))).toBe("Blacksmith");
    expect(lockedRequirement("equipment", built)).toBeNull();
    expect(lockedRequirement("helpers", village(10))).toBe("Helper Hut");
    expect(lockedRequirement("helpers", built)).toBeNull();
  });

  it("opens the Builder Base at Town Hall 6 or with a Builder Hall", () => {
    const noBuilderHall = (townHall: number) => {
      const result = village(townHall);
      result.data.builderBase.builderHallLevel = 0;
      return result;
    };
    expect(lockedRequirement("builderBaseUpgrades", noBuilderHall(5))).toBe("Town Hall 6");
    expect(lockedRequirement("builderBaseUpgrades", noBuilderHall(6))).toBeNull();

    const early = noBuilderHall(5);
    early.data.builderBase.builderHallLevel = 2;
    expect(lockedRequirement("builderBaseTroops", early)).toBeNull();
  });

  it("keeps Clan Capital locked below Town Hall 3 whatever the switch says", () => {
    expect(clanCapitalState(village(2, { clanCapitalEnabled: true }))).toBe("locked");
    expect(lockedRequirement("districts", village(2))).toBe("Town Hall 3");
  });

  it("treats an unset switch as on and false as off", () => {
    expect(clanCapitalState(village(3))).toBe("on");
    expect(clanCapitalState(village(3, { clanCapitalEnabled: false }))).toBe("off");
    expect(lockedRequirement("districts", village(3, { clanCapitalEnabled: false }))).toBeNull();
  });
});
