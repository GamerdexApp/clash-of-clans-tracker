import { shellText } from "@/lib/messages/shell";
import type { NavItemId } from "@/data/nav";
import type { Playthrough } from "@/types/app";

const text = shellText.locked;

export type ClanCapitalState = "locked" | "off" | "on";

const CLAN_CAPITAL_TOWN_HALL = 3;
const BUILDER_BASE_TOWN_HALL = 6;

const buildingLevel = (village: Playthrough, id: string) =>
  village.data.homeVillage.armyBuildings[id]?.[0]?.level ?? 0;

export const clanCapitalState = (village: Playthrough): ClanCapitalState => {
  if (village.data.homeVillage.townHallLevel < CLAN_CAPITAL_TOWN_HALL) return "locked";
  return village.clanCapitalEnabled === false ? "off" : "on";
};

const minimumTownHall: Partial<Record<NavItemId, number>> = {
  pets: 14,
  forge: 6,
  seasonPass: 7,
};

/** The requirement a village misses for a sidebar item, or null when the item is open. */
export const lockedRequirement = (id: NavItemId, village: Playthrough): string | null => {
  const townHall = village.data.homeVillage.townHallLevel;

  const required = minimumTownHall[id];
  if (required !== undefined) return townHall >= required ? null : text.townHall(required);

  if (id === "equipment") return buildingLevel(village, "blacksmith") > 0 ? null : text.blacksmith;
  if (id === "helpers") return buildingLevel(village, "helper-hut") > 0 ? null : text.helperHut;

  if (id === "builderBaseUpgrades" || id === "builderBaseTroops" || id === "builderBaseWalls") {
    const hasBuilderBase =
      townHall >= BUILDER_BASE_TOWN_HALL || village.data.builderBase.builderHallLevel > 0;
    return hasBuilderBase ? null : text.townHall(BUILDER_BASE_TOWN_HALL);
  }

  if (id === "districts" || id === "capitalTroops") {
    return clanCapitalState(village) === "locked" ? text.townHall(CLAN_CAPITAL_TOWN_HALL) : null;
  }

  return null;
};
