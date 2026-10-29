import { home } from "clash-of-clans-data";

import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { Playthrough } from "@/types/app";
import type { OreAmounts, EquipmentPiece, EquipmentStep } from "@/types/app/equipment";
import type { HomeVillageData } from "@/types/app/game";

interface RawLevel {
  level: number;
  upgradeShinyOre?: number;
  upgradeGlowingOre?: number;
  upgradeStarryOre?: number;
  blacksmithLevelRequired?: number;
}

interface RawEquipment {
  id: string;
  name: string;
  hero: string;
  rarity: "Common" | "Epic";
  images?: { icon?: string };
  levels: RawLevel[];
}

export const noOre: OreAmounts = { shiny: 0, glowing: 0, starry: 0 };

const catalog: EquipmentPiece[] = (home().heroEquipment().get() as unknown as RawEquipment[]).map((piece) => ({
  id: piece.id,
  name: piece.name,
  heroId: piece.hero,
  rarity: piece.rarity,
  imageUrl: piece.images?.icon ? toPublicImageUrl(piece.images.icon) : "",
  maxLevel: piece.levels[piece.levels.length - 1]?.level ?? 0,
  steps: piece.levels.map((level) => ({
    level: level.level,
    ore: {
      shiny: level.upgradeShinyOre ?? 0,
      glowing: level.upgradeGlowingOre ?? 0,
      starry: level.upgradeStarryOre ?? 0,
    },
    blacksmith: level.blacksmithLevelRequired ?? 0,
  })),
}));

export const equipmentForHero = (heroId: string): EquipmentPiece[] =>
  catalog.filter((piece) => piece.heroId === heroId);

const homeOf = (village: Playthrough) => village.data.homeVillage;

export const blacksmithLevel = (village: Playthrough): number =>
  homeOf(village).armyBuildings.blacksmith?.[0]?.level ?? 0;

/** A piece the player has not added reads as level 0. */
export const equipmentLevel = (village: Playthrough, heroName: string, pieceName: string): number =>
  homeOf(village).heroes
    .find((hero) => hero.name === heroName)
    ?.equipment?.find((piece) => piece.name === pieceName)?.level ?? 0;

/** Every level above the current one, lowest first. A piece at level 0 starts with its free level 1. */
export const remainingSteps = (piece: EquipmentPiece, level: number): EquipmentStep[] =>
  piece.steps.filter((step) => step.level > level);

export const totalOre = (steps: EquipmentStep[]): OreAmounts =>
  steps.reduce(
    (total, step) => ({
      shiny: total.shiny + step.ore.shiny,
      glowing: total.glowing + step.ore.glowing,
      starry: total.starry + step.ore.starry,
    }),
    noOre,
  );

/** The Blacksmith level a step still needs, or null when the Blacksmith is high enough. */
export const stepRequirement = (step: EquipmentStep, blacksmith: number): number | null =>
  step.blacksmith > blacksmith ? step.blacksmith : null;

/** The highest level the Blacksmith allows. Level 0 means even the first level is out of reach. */
export const highestAllowedLevel = (piece: EquipmentPiece, blacksmith: number): number =>
  piece.steps.filter((step) => step.blacksmith <= blacksmith).at(-1)?.level ?? 0;

export const isFree = (ore: OreAmounts) => ore.shiny === 0 && ore.glowing === 0 && ore.starry === 0;

/** A hero the player has not started tracking is added at level 0 when its equipment first changes. */
const withEquipmentLevel = (
  hv: HomeVillageData,
  heroName: string,
  pieceName: string,
  level: number,
): HomeVillageData => {
  const heroes = hv.heroes.some((hero) => hero.name === heroName)
    ? hv.heroes
    : [...hv.heroes, { name: heroName, level: 0, equipment: [] }];
  return {
    ...hv,
    heroes: heroes.map((hero) => {
      if (hero.name !== heroName) return hero;
      const equipment = hero.equipment ?? [];
      return {
        ...hero,
        equipment: equipment.some((piece) => piece.name === pieceName)
          ? equipment.map((piece) => (piece.name === pieceName ? { ...piece, level } : piece))
          : [...equipment, { name: pieceName, level }],
      };
    }),
  };
};

export const setEquipmentLevel = (
  village: Playthrough,
  heroName: string,
  pieceName: string,
  level: number,
): Playthrough => ({
  ...village,
  data: { ...village.data, homeVillage: withEquipmentLevel(homeOf(village), heroName, pieceName, level) },
});

const stock = (village: Playthrough): OreAmounts => village.oreStock ?? noOre;

export const setOreStock = (village: Playthrough, oreStock: OreAmounts): Playthrough => ({ ...village, oreStock });

/** Takes the ore a step costs out of the stock. The stock never goes below 0. */
export const deductOre = (village: Playthrough, ore: OreAmounts): Playthrough => {
  const held = stock(village);
  return setOreStock(village, {
    shiny: Math.max(0, held.shiny - ore.shiny),
    glowing: Math.max(0, held.glowing - ore.glowing),
    starry: Math.max(0, held.starry - ore.starry),
  });
};

/** Raises the piece by one level. The ore comes out of the stock only when asked and never blocks the upgrade. */
export const upgradeEquipment = (
  village: Playthrough,
  heroName: string,
  piece: EquipmentPiece,
  options: { deduct: boolean },
): Playthrough => {
  const next = remainingSteps(piece, equipmentLevel(village, heroName, piece.name))[0];
  if (!next) return village;
  const raised = setEquipmentLevel(village, heroName, piece.name, next.level);
  return options.deduct ? deductOre(raised, next.ore) : raised;
};

/** Enough ore in stock, or how many are missing, for each kind. */
export const oreShortage = (held: OreAmounts, needed: OreAmounts): OreAmounts => ({
  shiny: Math.max(0, needed.shiny - held.shiny),
  glowing: Math.max(0, needed.glowing - held.glowing),
  starry: Math.max(0, needed.starry - held.starry),
});

export const oreStockOf = stock;
