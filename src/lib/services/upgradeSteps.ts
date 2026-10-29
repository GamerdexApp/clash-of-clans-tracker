import {
  getBuildingUpgradeSteps,
  getCraftedDefenseUpgradeSteps,
  getHeroUpgradeSteps,
  getPetUpgradeSteps,
  getResearchUpgradeSteps,
  getTownHallUpgradeStep,
  getTownHallWeaponUpgradeSteps,
} from "@/lib/utils/upgradeHelpers";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { UpgradeStep } from "@/types/app/upgrade";

import { bbBuildingSteps, bbHeroSteps, builderHallSteps, clockTowerSteps } from "./builderBaseSteps";
import { heroIdForName, readLevel } from "./upgradeEngine";

/** Every step from the target's current level up to the most the village can reach. */
export const upgradeSteps = (village: Playthrough, target: UpgradeTarget): UpgradeStep[] => {
  const hv = village.data.homeVillage;
  const level = readLevel(village, target);
  switch (target.kind) {
    case "building": {
      const supercharge = hv[target.record][target.buildingId]?.[target.instanceIndex]?.superchargeLevel ?? 0;
      return getBuildingUpgradeSteps(target.buildingId, level, hv.townHallLevel, target.instanceIndex, supercharge);
    }
    case "hero": {
      const heroId = heroIdForName(target.name);
      return heroId ? getHeroUpgradeSteps(heroId, level, hv.townHallLevel) : [];
    }
    case "townHall": {
      const step = getTownHallUpgradeStep(level);
      return step ? [step] : [];
    }
    case "townHallWeapon":
      return getTownHallWeaponUpgradeSteps(hv.townHallLevel, level);
    case "crafted":
      return getCraftedDefenseUpgradeSteps(target.defenseId, target.moduleIndex, level);
    case "research":
      return getResearchUpgradeSteps(target.name, level, hv.townHallLevel);
    case "pet":
      return getPetUpgradeSteps(target.name, level);
    case "bbBuilding":
      return bbBuildingSteps(target.record, target.buildingId, level, village.data.builderBase.builderHallLevel);
    case "bbHero":
      return bbHeroSteps(target.name, level, village.data.builderBase.builderHallLevel);
    case "clockTower":
      return clockTowerSteps(level, village.data.builderBase.builderHallLevel);
    case "builderHall":
      return builderHallSteps(level);
  }
};

export const nextStep = (village: Playthrough, target: UpgradeTarget): UpgradeStep | null =>
  upgradeSteps(village, target)[0] ?? null;
