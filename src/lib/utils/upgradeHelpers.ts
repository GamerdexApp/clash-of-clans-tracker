import { home, calculators, GemsCalculator } from "clash-of-clans-data";
import { getMaxHeroHallLevel } from "@/lib/utils/progressHelpers";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { advanceToActiveWindow } from "@/lib/utils/activeHoursHelpers";
import type { HomeVillageData } from "@/types/app/game";
import type { BuilderSlot, UpgradeStep } from "@/types/app/upgrade";
import type { BuilderQueueItem, ResearchQueueItem, PetQueueItem, TimelineBlock } from "@/types/app/queue";
import type { ActiveHours } from "@/types/app/playthrough";

const _home = home() as any;

type RawBuildTime = { days?: number; hours?: number; minutes?: number; seconds?: number };

const timeToDurationMs = (t: RawBuildTime): number  => {
  return (
    ((t.days ?? 0) * 86400 +
      (t.hours ?? 0) * 3600 +
      (t.minutes ?? 0) * 60 +
      (t.seconds ?? 0)) *
    1000
  );
}

const normalizeTime = (t: RawBuildTime): Required<RawBuildTime>  => {
  return { days: t.days ?? 0, hours: t.hours ?? 0, minutes: t.minutes ?? 0, seconds: t.seconds ?? 0 };
}

/** Apply builder or research boost to a durationMs value. Returns original ms unchanged if boostPct is 0. */
export const applyBoost = (durationMs: number, boostPct: 0 | 10 | 15 | 20): number  => {
  if (boostPct === 0 || durationMs <= 0) return durationMs;
  const totalSecs = Math.floor(durationMs / 1000);
  const raw: RawBuildTime = {
    days: Math.floor(totalSecs / 86400),
    hours: Math.floor((totalSecs % 86400) / 3600),
    minutes: Math.floor((totalSecs % 3600) / 60),
    seconds: totalSecs % 60,
  };
  const boosted = calculators().boost().builderBoost(normalizeTime(raw), boostPct);
  return timeToDurationMs(boosted);
}

/** Apply builder boost to a cost value. Returns original cost unchanged if boostPct is 0. */
export const applyBuilderBoostCost = (cost: number, boostPct: 0 | 10 | 15 | 20): number  => {
  if (boostPct === 0 || cost <= 0) return cost;
  return calculators().boost().builderBoostCost(cost, "Gold" as any, boostPct);
}

/** Apply research boost to a cost value. Returns original cost unchanged if boostPct is 0. */
export const applyResearchBoostCost = (cost: number, boostPct: 0 | 10 | 15 | 20): number  => {
  if (boostPct === 0 || cost <= 0) return cost;
  return calculators().boost().researchBoostCost(cost, "Elixir" as any, boostPct);
}

export const msToBuildTime = (ms: number): Required<RawBuildTime>  => {
  const totalSecs = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSecs / 86400),
    hours: Math.floor((totalSecs % 86400) / 3600),
    minutes: Math.floor((totalSecs % 3600) / 60),
    seconds: totalSecs % 60,
  };
}

/** Calculate the gem cost to instantly complete an upgrade of the given duration in ms. */
export const getGemCost = (durationMs: number): number  => {
  return new GemsCalculator().cost(msToBuildTime(durationMs));
}

type RawLevel = {
  level: number;
  townHallRequired?: number;
  supercharge?: boolean;
  buildCost?: number;
  buildCostResource?: string;
  buildTime?: RawBuildTime;
  images?: { normal?: string };
};

type RawPlacementCost = { instance: number; cost: number; costResource: string };
type RawBuilding = { id: string; name: string; levels: RawLevel[]; placementCosts?: RawPlacementCost[] };

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
] as const;

const allHomeBuildings = (): RawBuilding[]  => {
  const armyBuildings: RawBuilding[] = [];
  for (const file of ARMY_BUILDING_FILES) {
    try {
      armyBuildings.push(require(`clash-of-clans-data/data/home/army-buildings/${file}.json`) as RawBuilding);
    } catch {
      // file missing in this version of the package — skip
    }
  }
  return [
    ...(_home.defenses().get() as RawBuilding[]),
    ...(_home.guardians().get() as RawBuilding[]),
    ...(_home.resourceBuildings().get() as RawBuilding[]),
    ...(_home.traps().get() as RawBuilding[]),
    ...armyBuildings,
  ];
}

const _buildingMap = new Map<string, RawBuilding>(
  allHomeBuildings().map((b) => [b.id, b])
);

export const getBuildingName = (buildingId: string): string => _buildingMap.get(buildingId)?.name ?? buildingId;

/**
 * Returns all upgrade steps from currentLevel+1 up to the max level
 * available at thLevel for the given building id.
 */
export const getBuildingUpgradeSteps = (
  buildingId: string,
  currentLevel: number,
  thLevel: number,
  instanceIndex = 0,
  currentSuperchargeLevel = 0
): UpgradeStep[]  => {
  const building = _buildingMap.get(buildingId);
  if (!building) return [];

  const normalLevels = building.levels.filter((l) => !l.supercharge);
  const normalMax = normalLevels.length > 0 ? Math.max(...normalLevels.map((l) => l.level)) : 0;

  const normalSteps = normalLevels
    .filter((l) => l.level > currentLevel && (l.townHallRequired ?? 0) <= thLevel && l.buildCost !== undefined)
    .map((l) => {
      const durationMs = timeToDurationMs(l.buildTime ?? {});
      if (l.level === 1 && currentLevel === 0 && building.placementCosts) {
        const placement = building.placementCosts.find((p) => p.instance === instanceIndex + 1);
        if (placement) {
          return { level: l.level, cost: placement.cost, costResource: placement.costResource, buildTime: normalizeTime(l.buildTime ?? {}), durationMs, imageUrl: toPublicImageUrl(l.images?.normal) };
        }
      }
      return { level: l.level, cost: l.buildCost!, costResource: l.buildCostResource ?? "Gold", buildTime: normalizeTime(l.buildTime ?? {}), durationMs, imageUrl: toPublicImageUrl(l.images?.normal) };
    });

  // Only show supercharge steps once normal upgrades are complete
  const superchargeSteps = currentLevel >= normalMax
    ? building.levels
        .filter((l) => l.supercharge && l.level > currentSuperchargeLevel && (l.townHallRequired ?? 0) <= thLevel && l.buildCost !== undefined)
        .map((l) => ({
          level: l.level,
          cost: l.buildCost!,
          costResource: l.buildCostResource ?? "Gold",
          buildTime: normalizeTime(l.buildTime ?? {}),
          durationMs: timeToDurationMs(l.buildTime ?? {}),
          imageUrl: toPublicImageUrl(l.images?.normal),
          isSupercharge: true as const,
        }))
    : [];

  return [...normalSteps, ...superchargeSteps];
}

type RawResearchLevel = {
  level: number;
  townHallRequired?: number;
  laboratoryRequired?: number;
  researchCost?: number;
  researchCostResource?: string;
  researchTime?: RawBuildTime;
  images?: { normal?: string };
};

type RawResearchItem = { name: string; levels: RawResearchLevel[] };

const allResearchItems = (): RawResearchItem[]  => {
  return [
    ...(_home.troops().get() as RawResearchItem[]),
    ...(_home.spells().get() as RawResearchItem[]),
    ...(_home.siegeMachines().get() as RawResearchItem[]),
  ];
}

const _researchMap = new Map<string, RawResearchItem>(
  allResearchItems().map((r) => [r.name.toLowerCase(), r])
);

/**
 * Returns all research steps from currentLevel+1 to max for a troop/spell/siege.
 */
export const getResearchUpgradeSteps = (
  name: string,
  currentLevel: number,
  thLevel: number
): UpgradeStep[]  => {
  const item = _researchMap.get(name.toLowerCase());
  if (!item) return [];
  return item.levels
    .filter(
      (l) =>
        l.level > currentLevel &&
        (l.townHallRequired ?? 0) <= thLevel &&
        l.researchCost !== undefined
    )
    .map((l) => ({
      level: l.level,
      cost: l.researchCost!,
      costResource: l.researchCostResource ?? "Elixir",
      buildTime: normalizeTime(l.researchTime ?? {}),
      durationMs: timeToDurationMs(l.researchTime ?? {}),
      ...(l.laboratoryRequired ? { requires: { building: "laboratory" as const, level: l.laboratoryRequired } } : {}),
      // data package sometimes maps wrong level number in image filename; override with actual level
      imageUrl: toPublicImageUrl(l.images?.normal?.replace(/level-\d+\.png$/, `level-${l.level}.png`)),
    }));
}

type RawPetLevel = {
  level: number;
  townHallRequired?: number;
  upgradeCost?: number;
  upgradeCostResource?: string;
  upgradeTime?: RawBuildTime;
  petHouseLevelRequired?: number;
  images?: { normal?: string };
};

type RawPet = { name: string; levels: RawPetLevel[]; images?: { icon?: string } };

const _petMap = new Map<string, RawPet>(
  (_home.pets().get() as RawPet[]).map((p) => [p.name.toLowerCase(), p])
);

/** Returns all research steps from currentLevel+1 to max for a pet. */
export const getPetUpgradeSteps = (name: string, currentLevel: number): UpgradeStep[]  => {
  const item = _petMap.get(name.toLowerCase());
  if (!item) return [];
  return item.levels
    .filter((l) => l.level > currentLevel && l.upgradeCost !== undefined && l.upgradeCost > 0)
    .map((l) => ({
      level: l.level,
      cost: l.upgradeCost!,
      costResource: l.upgradeCostResource ?? "Dark Elixir",
      buildTime: normalizeTime(l.upgradeTime ?? {}),
      durationMs: timeToDurationMs(l.upgradeTime ?? {}),
      ...(l.petHouseLevelRequired ? { requires: { building: "pet-house" as const, level: l.petHouseLevelRequired } } : {}),
      imageUrl: toPublicImageUrl(l.images?.normal),
    }));
}

type RawCraftedModule = {
  name: string;
  upgrades: Array<{ level: number; buildCost?: number; buildCostResource?: string; buildTime?: RawBuildTime }>;
};
type RawCraftedDefense = {
  id: string;
  name: string;
  modules: RawCraftedModule[];
  images: Array<{ fromEffectiveLevel?: number; toEffectiveLevel?: number; normal?: string }>;
};

const _craftedMap = new Map<string, RawCraftedDefense>(
  (_home.craftedDefenses().current().get() as RawCraftedDefense[]).map((c) => [c.id, c])
);

export const getCraftedDefenseUpgradeSteps = (
  defenseId: string,
  moduleIndex: number,
  currentLevel: number
): UpgradeStep[]  => {
  const defense = _craftedMap.get(defenseId);
  if (!defense) return [];
  const mod = defense.modules[moduleIndex];
  if (!mod) return [];
  const imageUrl = toPublicImageUrl(defense.images[0]?.normal);
  return mod.upgrades
    .filter((u) => u.level > currentLevel && (u.buildCost ?? 0) > 0)
    .map((u) => ({
      level: u.level,
      cost: u.buildCost!,
      costResource: u.buildCostResource ?? "Elixir",
      buildTime: normalizeTime(u.buildTime ?? {}),
      durationMs: timeToDurationMs(u.buildTime ?? {}),
      imageUrl,
    }));
}

export const getCraftedDefenseName = (defenseId: string): string  => {
  return _craftedMap.get(defenseId)?.name ?? defenseId;
}

export const getCraftedDefenseModuleName = (defenseId: string, moduleIndex: number): string  => {
  return _craftedMap.get(defenseId)?.modules[moduleIndex]?.name ?? `Module ${moduleIndex + 1}`;
}

export const getCraftedDefenseImageUrl = (defenseId: string): string  => {
  return toPublicImageUrl(_craftedMap.get(defenseId)?.images[0]?.normal);
}

type RawHeroLevel = {
  level: number;
  heroHallLevelRequired?: number;
  upgradeCost?: number;
  upgradeCostResource?: string;
  upgradeTime?: RawBuildTime;
  images?: { normal?: string };
};

type RawHero = { id: string; name: string; images?: { icon?: string }; levels: RawHeroLevel[] };

const _heroMap = new Map<string, RawHero>(
  (_home.heroes().get() as RawHero[]).map((h) => [h.id, h])
);

/** Returns all upgrade steps from currentLevel+1 to max for a hero at the given TH. */
export const getHeroUpgradeSteps = (
  heroId: string,
  currentLevel: number,
  thLevel: number
): UpgradeStep[]  => {
  const hero = _heroMap.get(heroId);
  if (!hero) return [];
  const heroHallLevel = getMaxHeroHallLevel(thLevel);
  return hero.levels
    .filter(
      (l) =>
        l.level > currentLevel &&
        (l.heroHallLevelRequired ?? 0) <= heroHallLevel &&
        l.upgradeCost !== undefined
    )
    .map((l) => ({
      level: l.level,
      cost: l.upgradeCost!,
      costResource: l.upgradeCostResource ?? "Dark Elixir",
      buildTime: normalizeTime(l.upgradeTime ?? {}),
      durationMs: timeToDurationMs(l.upgradeTime ?? {}),
      imageUrl: toPublicImageUrl(hero.images?.icon),
    }));
}

export const isActiveUpgrade = (finishesAt: string | undefined): boolean  => {
  if (!finishesAt) return false;
  return new Date(finishesAt) > new Date();
}

/** Count of actively researching troops/spells/siege. */
export const countActiveResearch = (hv: HomeVillageData): number  => {
  return [...hv.troops, ...hv.spells, ...hv.siegeMachines].filter(
    (i) => (i as any).upgrade && isActiveUpgrade((i as any).upgrade.finishesAt)
  ).length;
}

/** Count of actively researching pets. */
export const countActivePets = (hv: HomeVillageData): number  => {
  return hv.pets.filter((p) => (p as any).upgrade && isActiveUpgrade((p as any).upgrade.finishesAt)).length;
}

type RawTHLevel = {
  level: number;
  buildCost: number;
  buildCostResource: string;
  buildTime: RawBuildTime;
  images?: { normal?: string };
  weapon?: {
    name: string;
    levels: Array<{
      level: number;
      buildCost: number;
      buildCostResource: string;
      buildTime: RawBuildTime;
      xpGained?: number;
      images?: { normal?: string; townHall?: string };
    }>;
  };
};

const _thData: RawTHLevel[] = (() => {
  try {
    return require("clash-of-clans-data/data/home/town-hall/town-hall.json").levels as RawTHLevel[];
  } catch {
    return [];
  }
})();

const _thMaxLevel = _thData.length;

export const getTownHallImageUrl = (thLevel: number): string  => {
  const lvl = _thData.find((l) => l.level === thLevel);
  return toPublicImageUrl(lvl?.images?.normal);
}

/** Returns the upgrade step to reach TH (currentLevel+1), or null if at max. */
export const getTownHallUpgradeStep = (currentLevel: number): UpgradeStep | null  => {
  const nextLevel = currentLevel + 1;
  const lvl = _thData.find((l) => l.level === nextLevel);
  if (!lvl || lvl.buildCost === 0) return null;
  return {
    level: nextLevel,
    cost: lvl.buildCost,
    costResource: lvl.buildCostResource ?? "Gold",
    buildTime: normalizeTime(lvl.buildTime ?? {}),
    durationMs: timeToDurationMs(lvl.buildTime ?? {}),
  };
}

/** Returns the max TH level defined in data. */
export const getTownHallMaxLevel = (): number  => {
  return _thMaxLevel;
}

/**
 * Returns upgrade steps for the TH weapon (e.g. Inferno Artillery on TH17).
 * Only THs whose weapon has levels with buildCost > 0 have upgradeable weapons.
 * currentWeaponLevel is 1-based (weapon starts at level 1 when TH is built).
 */
export const getTownHallWeaponUpgradeSteps = (thLevel: number, currentWeaponLevel: number): UpgradeStep[]  => {
  const lvl = _thData.find((l) => l.level === thLevel);
  if (!lvl?.weapon) return [];
  return lvl.weapon.levels
    .filter((wl) => wl.level > currentWeaponLevel && wl.buildCost > 0)
    .map((wl) => ({
      level: wl.level,
      cost: wl.buildCost,
      costResource: wl.buildCostResource ?? "Gold",
      buildTime: normalizeTime(wl.buildTime ?? {}),
      durationMs: timeToDurationMs(wl.buildTime ?? {}),
    }));
}

/** Returns name and max level of the TH weapon for a given TH level, or null if no weapon. */
export const getTownHallWeaponInfo = (thLevel: number): { name: string; maxLevel: number; imageUrl: string } | null => {
  const lvl = _thData.find((l) => l.level === thLevel);
  if (!lvl?.weapon || lvl.weapon.levels.length <= 1) return null;
  const hasUpgrades = lvl.weapon.levels.some((wl) => wl.buildCost > 0);
  if (!hasUpgrades) return null;
  const maxLevel = lvl.weapon.levels[lvl.weapon.levels.length - 1]?.level ?? lvl.weapon.levels.length;
  const topLvl = lvl.weapon.levels[lvl.weapon.levels.length - 1];
  const topImg = topLvl?.images?.townHall ?? topLvl?.images?.normal;
  const imageUrl = toPublicImageUrl(topImg);
  return { name: lvl.weapon.name, maxLevel, imageUrl };
};
