import { builder } from "clash-of-clans-data";

import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { msToBuildTime } from "@/lib/utils/upgradeHelpers";
import type { BuildingRecordKey } from "@/types/app/game";
import type { UpgradeStep } from "@/types/app/upgrade";

interface RawTime {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

interface RawBuildingLevel {
  level: number;
  buildCost?: number;
  buildCostResource?: string;
  buildTime?: RawTime;
  builderHallRequired?: number;
  images?: { normal?: string };
}

interface RawBuilding {
  id: string;
  name: string;
  levels: RawBuildingLevel[];
}

interface RawHeroLevel {
  level: number;
  builderHallLevelRequired?: number;
  upgradeCost?: number;
  upgradeCostResource?: string;
  upgradeTime?: RawTime;
}

interface RawHero {
  id: string;
  name: string;
  levels: RawHeroLevel[];
}

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const toMs = (time: RawTime | undefined): number =>
  ((time?.days ?? 0) * DAY_MS) +
  ((time?.hours ?? 0) * HOUR_MS) +
  ((time?.minutes ?? 0) * MINUTE_MS) +
  ((time?.seconds ?? 0) * SECOND_MS);

const catalog = builder();

const buildingsOf = (record: BuildingRecordKey): RawBuilding[] => {
  switch (record) {
    case "defenses":
      return catalog.defenses().get() as unknown as RawBuilding[];
    case "traps":
      return catalog.traps().get() as unknown as RawBuilding[];
    case "resourceBuildings":
      return catalog.resourceBuildings().get() as unknown as RawBuilding[];
    case "armyBuildings":
      return catalog.armyBuildings().get() as unknown as RawBuilding[];
  }
};

const heroes = catalog.heroes().get() as unknown as RawHero[];
const clockTower = (catalog.otherBuildings().get() as unknown as RawBuilding[]).find((building) => building.id === "clock-tower");
const builderHall = (catalog.builderHall().get() as unknown as RawBuilding[])[0];

const stepFrom = (
  level: number,
  cost: number | undefined,
  resource: string | undefined,
  time: RawTime | undefined,
  imageUrl: string | undefined,
): UpgradeStep => {
  const durationMs = toMs(time);
  return {
    level,
    cost: cost ?? 0,
    costResource: resource ?? "Builder Gold",
    buildTime: msToBuildTime(durationMs),
    durationMs,
    imageUrl: imageUrl ? toPublicImageUrl(imageUrl) : undefined,
  };
};

const buildingSteps = (levels: RawBuildingLevel[], level: number, builderHall: number): UpgradeStep[] =>
  levels
    .filter((candidate) => candidate.level > level && (candidate.builderHallRequired ?? 0) <= builderHall)
    .map((candidate) =>
      stepFrom(candidate.level, candidate.buildCost, candidate.buildCostResource, candidate.buildTime, candidate.images?.normal),
    );

/** Steps from the level above the current one up to the most this Builder Hall allows. */
export const bbBuildingSteps = (
  record: BuildingRecordKey,
  buildingId: string,
  level: number,
  builderHallLevel: number,
): UpgradeStep[] => {
  const building = buildingsOf(record).find((candidate) => candidate.id === buildingId);
  return building ? buildingSteps(building.levels, level, builderHallLevel) : [];
};

export const bbHeroSteps = (heroName: string, level: number, builderHallLevel: number): UpgradeStep[] => {
  const hero = heroes.find((candidate) => candidate.name === heroName);
  if (!hero) return [];
  return hero.levels
    .filter((candidate) => candidate.level > level && (candidate.builderHallLevelRequired ?? 0) <= builderHallLevel)
    .map((candidate) => stepFrom(candidate.level, candidate.upgradeCost, candidate.upgradeCostResource, candidate.upgradeTime, undefined));
};

export const clockTowerSteps = (level: number, builderHallLevel: number): UpgradeStep[] =>
  clockTower ? buildingSteps(clockTower.levels, level, builderHallLevel) : [];

/** The highest Clock Tower level this Builder Hall allows. */
export const clockTowerMaxLevel = (builderHallLevel: number): number =>
  (clockTower?.levels ?? []).filter((level) => (level.builderHallRequired ?? 0) <= builderHallLevel).at(-1)?.level ?? 0;

/** The picture for a Clock Tower level. An unbuilt Clock Tower shows its first level. */
export const clockTowerImageUrl = (level: number): string => {
  const image = clockTower?.levels.find((candidate) => candidate.level === Math.max(1, level))?.images?.normal;
  return image ? toPublicImageUrl(image) : "";
};

/** The Builder Hall has one step at a time: the next level. */
export const builderHallSteps = (level: number): UpgradeStep[] =>
  builderHall ? buildingSteps(builderHall.levels, level, 99).slice(0, 1) : [];

export const builderHallImageUrl = (level: number): string => {
  const image = builderHall?.levels.find((candidate) => candidate.level === Math.max(1, level))?.images?.normal;
  return image ? toPublicImageUrl(image) : "";
};

export const bbBuildingName = (buildingId: string): string => {
  for (const record of ["defenses", "traps", "resourceBuildings", "armyBuildings"] as const) {
    const found = buildingsOf(record).find((candidate) => candidate.id === buildingId);
    if (found) return found.name;
  }
  return buildingId;
};
