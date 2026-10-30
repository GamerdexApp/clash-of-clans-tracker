import type { CompletedUpgrade, UpgradeTarget } from "@/types/app/engine";
import { gameText } from "@/lib/messages/game";
import { getBuildingName, getCraftedDefenseModuleName, getCraftedDefenseName } from "@/lib/utils/upgradeHelpers";
import { bbBuildingName } from "./builderBaseSteps";

/** The name a player reads, with the instance number the game uses (Cannon #3). */
export const targetName = (target: UpgradeTarget): string => {
  switch (target.kind) {
    case "building":
      return `${getBuildingName(target.buildingId)} #${target.instanceIndex + 1}`;
    case "hero":
      return target.name;
    case "townHall":
      return gameText.places.townHall;
    case "townHallWeapon":
      return gameText.places.townHallWeapon;
    case "research":
    case "pet":
    case "bbHero":
      return target.name;
    case "bbBuilding":
      return `${bbBuildingName(target.buildingId)} #${target.instanceIndex + 1}`;
    case "clockTower":
      return gameText.places.clockTower;
    case "builderHall":
      return gameText.places.builderHall;
    case "bbTroop":
      return target.name;
    case "crafted":
      return `${getCraftedDefenseName(target.defenseId)}, ${getCraftedDefenseModuleName(target.defenseId, target.moduleIndex)}`;
  }
};

export const completedLabel = ({ target, fromLevel, toLevel }: CompletedUpgrade): string =>
  `${targetName(target)} Lv ${fromLevel} to ${toLevel}`;
