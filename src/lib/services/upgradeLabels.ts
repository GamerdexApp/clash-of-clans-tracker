import { getBuildingName, getCraftedDefenseModuleName, getCraftedDefenseName } from "@/lib/utils/upgradeHelpers";
import type { CompletedUpgrade, UpgradeTarget } from "@/types/app/engine";

/** The name a player reads, with the instance number the game uses (Cannon #3). */
export const targetName = (target: UpgradeTarget): string => {
  switch (target.kind) {
    case "building":
      return `${getBuildingName(target.buildingId)} #${target.instanceIndex + 1}`;
    case "hero":
      return target.name;
    case "townHall":
      return "Town Hall";
    case "townHallWeapon":
      return "Town Hall weapon";
    case "research":
    case "pet":
      return target.name;
    case "crafted":
      return `${getCraftedDefenseName(target.defenseId)}, ${getCraftedDefenseModuleName(target.defenseId, target.moduleIndex)}`;
  }
};

export const completedLabel = ({ target, fromLevel, toLevel }: CompletedUpgrade): string =>
  `${targetName(target)} Lv ${fromLevel} to ${toLevel}`;
