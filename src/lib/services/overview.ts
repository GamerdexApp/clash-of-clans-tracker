import { home } from "clash-of-clans-data";

import { formatNumber } from "@/lib/format";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { blacksmithLevel } from "./equipment";
import { heroIdForName } from "./upgradeEngine";
import {
  calcCraftedDefensesProgress,
  calcDaysAt,
  calcEquipmentProgress,
  calcHomeLabProgress,
  calcHomeStructuresProgress,
  calcHomeTrapsProgress,
  calcPetsProgress,
  calcSuperchargeProgress,
  calcWallsProgress,
  getHomeWallData,
  getMaxHeroHallLevel,
  regularTroopNames,
  calcHomeHeroesProgress,
  type ProgressResult,
} from "@/lib/utils/progressHelpers";
import { clanCapitalState } from "./navAccess";
import type { Playthrough } from "@/types/app";
import type { TrackedHero, TrackedItem } from "@/types/app/game";

export interface StatTile {
  id: string;
  label: string;
  value: string;
  sub?: string;
}

/** Every stored stat of the player. Clan Capital contributions hide with tracking off. */
export const overviewStats = (village: Playthrough): StatTile[] => {
  const { data } = village;
  const tiles: StatTile[] = [
    { id: "level", label: "Level", value: formatNumber(data.expLevel) },
    { id: "warStars", label: "War stars", value: formatNumber(data.warStars) },
    {
      id: "trophies",
      label: "Trophies",
      value: formatNumber(data.homeVillage.trophies),
      sub: data.homeVillage.leagueName || undefined,
    },
    { id: "bestTrophies", label: "Best trophies", value: formatNumber(data.homeVillage.bestTrophies) },
    { id: "donations", label: "Donations", value: formatNumber(data.donations) },
    { id: "received", label: "Donations received", value: formatNumber(data.donationsReceived) },
    { id: "war", label: "War preference", value: data.warPreference === "in" ? "In" : "Out" },
    { id: "attacks", label: "Attack wins", value: formatNumber(data.homeVillage.attackWins) },
    { id: "defenses", label: "Defense wins", value: formatNumber(data.homeVillage.defenseWins) },
    {
      id: "builderTrophies",
      label: "Builder trophies",
      value: formatNumber(data.builderBase.builderBaseTrophies),
      sub: data.builderBase.builderBaseLeagueName || undefined,
    },
    { id: "bestBuilderTrophies", label: "Best builder trophies", value: formatNumber(data.builderBase.bestBuilderBaseTrophies) },
  ];
  if (clanCapitalState(village) !== "off") {
    tiles.push({ id: "contributions", label: "Capital contributions", value: formatNumber(data.clanCapital.clanCapitalContributions) });
  }
  return tiles;
};

export interface ProgressCardData {
  id: string;
  label: string;
  result: ProgressResult;
  sub?: string;
  href: string;
  /** The requirement of a card that cannot apply yet. */
  lock?: string;
}

const LOCK_AT: Record<string, string> = {
  supercharge: "Town Hall 17",
  crafted: "Town Hall 18",
  pets: "Town Hall 14",
  heroes: "Town Hall 7",
  equipment: "Blacksmith",
};

/** Nine progress cards, never hidden. A card with nothing to measure yet is locked and says what it needs. */
export const homeProgressCards = (village: Playthrough): ProgressCardData[] => {
  const hv = village.data.homeVillage;
  const townHall = hv.townHallLevel;
  const walls = getHomeWallData(townHall);
  const cards: Omit<ProgressCardData, "lock">[] = [
    { id: "structures", label: "Structures", result: calcHomeStructuresProgress(hv, townHall), sub: "Defenses, army, resources", href: "/builder" },
    { id: "traps", label: "Traps", result: calcHomeTrapsProgress(hv, townHall), href: "/builder?tab=traps" },
    { id: "supercharge", label: "Supercharge", result: calcSuperchargeProgress(hv, townHall), href: "/builder" },
    { id: "crafted", label: "Crafted Defenses", result: calcCraftedDefensesProgress(hv, townHall), href: "/builder?tab=crafted" },
    { id: "lab", label: "Lab", result: calcHomeLabProgress(hv, townHall), sub: "Troops, spells, siege", href: "/research" },
    { id: "heroes", label: "Heroes", result: calcHomeHeroesProgress(hv.heroes, townHall), href: "/builder?tab=heroes" },
    { id: "equipment", label: "Equipment", result: calcEquipmentProgress(hv.heroes), href: "/equipment" },
    { id: "pets", label: "Pets", result: calcPetsProgress(hv.pets, townHall), href: "/pets" },
    {
      id: "walls",
      label: "Walls",
      result: calcWallsProgress(hv.walls, townHall),
      sub: walls.totalAtTH > 0 ? `${walls.totalAtTH} walls, max level ${walls.maxLevel}` : undefined,
      href: "/walls",
    },
  ];
  return cards.map((card) => ({ ...card, lock: card.result.max === 0 ? LOCK_AT[card.id] : undefined }));
};

export interface ItemTileData {
  name: string;
  level: number;
  maxLevel: number;
  imageUrl: string;
  /** Level 0, or not available at this hall yet. */
  locked: boolean;
  maxed: boolean;
  upgrading: boolean;
  /** What an item the village cannot use yet needs. */
  requirement?: string;
}

interface RawLevel {
  level: number;
  townHallRequired?: number;
  heroHallLevelRequired?: number;
  researchCostResource?: string;
}

interface RawEntry {
  name: string;
  hero?: string;
  images?: { icon?: string };
  levels: RawLevel[];
}

const raw = home() as unknown as Record<"troops" | "spells" | "siegeMachines" | "pets" | "heroes" | "heroEquipment", () => { get: () => RawEntry[] }>;
const allTroops = raw.troops().get().filter((troop) => regularTroopNames.has(troop.name.toLowerCase()));
const allSpells = raw.spells().get();
const allSiege = raw.siegeMachines().get();
const allPets = raw.pets().get();
const allHeroes = raw.heroes().get();
const allEquipment = raw.heroEquipment().get();

const darkElixirTroops = new Set(allTroops.filter((troop) => troop.levels[0]?.researchCostResource === "Dark Elixir").map((troop) => troop.name.toLowerCase()));

type Saved = TrackedItem | TrackedHero | undefined;

const tileFor = (entry: RawEntry, saved: Saved, maxLevel: number, requirement: string | undefined, now: Date): ItemTileData => {
  const level = saved?.level ?? 0;
  return {
    name: entry.name,
    level,
    maxLevel,
    imageUrl: toPublicImageUrl(entry.images?.icon),
    locked: level === 0 || maxLevel === 0,
    maxed: maxLevel > 0 && level >= maxLevel,
    upgrading: saved?.upgrade !== undefined && Date.parse(saved.upgrade.finishesAt) > now.getTime(),
    requirement: maxLevel === 0 ? requirement : undefined,
  };
};

const savedByName = (items: Array<TrackedItem | TrackedHero>) => new Map(items.map((item) => [item.name.toLowerCase(), item]));

/** Levels a Town Hall allows, and the first Town Hall that allows one. */
const townHallTile = (entry: RawEntry, saved: Saved, townHall: number, now: Date) => {
  const maxLevel = entry.levels.filter((level) => (level.townHallRequired ?? 0) <= townHall).length;
  const first = entry.levels[0]?.townHallRequired;
  return tileFor(entry, saved, maxLevel, first ? `Town Hall ${first}` : undefined, now);
};

export interface HeroTileData extends ItemTileData {
  equipment: ItemTileData[];
}

export interface HomeItemGroups {
  troops: ItemTileData[];
  spells: ItemTileData[];
  heroes: HeroTileData[];
  siege: ItemTileData[];
  pets: ItemTileData[];
}

/**
 * Every troop, spell, hero, piece of equipment, siege machine and pet of the game. One the village
 * cannot use yet shows locked with what it needs. Troops list Elixir first, then Dark Elixir.
 */
export const homeItemGroups = (village: Playthrough, now: Date): HomeItemGroups => {
  const hv = village.data.homeVillage;
  const townHall = hv.townHallLevel;
  const heroHall = getMaxHeroHallLevel(townHall);
  const hasBlacksmith = blacksmithLevel(village) > 0;
  const troops = savedByName(hv.troops);
  const spells = savedByName(hv.spells);
  const siege = savedByName(hv.siegeMachines);
  const pets = savedByName(hv.pets);
  const heroes = savedByName(hv.heroes);

  return {
    troops: [...allTroops]
      .sort((a, b) => Number(darkElixirTroops.has(a.name.toLowerCase())) - Number(darkElixirTroops.has(b.name.toLowerCase())))
      .map((entry) => townHallTile(entry, troops.get(entry.name.toLowerCase()), townHall, now)),
    spells: allSpells.map((entry) => townHallTile(entry, spells.get(entry.name.toLowerCase()), townHall, now)),
    siege: allSiege.map((entry) => townHallTile(entry, siege.get(entry.name.toLowerCase()), townHall, now)),
    pets: allPets.map((entry) => {
      const first = entry.levels[0]?.townHallRequired ?? 0;
      return tileFor(entry, pets.get(entry.name.toLowerCase()), first <= townHall ? entry.levels.length : 0, `Town Hall ${first}`, now);
    }),
    heroes: allHeroes.map((entry) => {
      const maxLevel = entry.levels.filter((level) => (level.heroHallLevelRequired ?? 0) <= heroHall).length;
      const saved = heroes.get(entry.name.toLowerCase()) as TrackedHero | undefined;
      const owned = new Map((saved?.equipment ?? []).map((piece) => [piece.name.toLowerCase(), piece]));
      return {
        ...tileFor(entry, saved, maxLevel, `Hero Hall ${entry.levels[0]?.heroHallLevelRequired ?? 1}`, now),
        equipment: allEquipment
          .filter((piece) => piece.hero === heroIdForName(entry.name))
          .map((piece) => tileFor(piece, owned.get(piece.name.toLowerCase()), maxLevel > 0 && hasBlacksmith ? piece.levels.length : 0, maxLevel === 0 ? `Hero Hall ${entry.levels[0]?.heroHallLevelRequired ?? 1}` : "Blacksmith", now)),
      };
    }),
  };
};

interface RawResourceBuilding {
  id: string;
  levels: Array<{ level: number; capacity?: number; productionRate?: number; townHallRequired?: number }>;
}

const homeData = home();
const resourceBuildings = new Map(
  (homeData.resourceBuildings().get() as unknown as RawResourceBuilding[]).map((building) => [building.id, building]),
);
const townHallStorage = (homeData.townHall().get() as unknown as Array<{ levels: Array<{ level: number; storageCapacity: { gold: number; elixir: number; darkElixir: number } }> }>)[0]
  .levels;

export interface ResourceRow {
  id: "gold" | "elixir" | "darkElixir";
  label: string;
  image: string;
  perHour: number;
  storage: number;
}

/** What the built collectors make per hour and the built storages hold. */
export const homeResources = (village: Playthrough): ResourceRow[] => {
  const hv = village.data.homeVillage;
  const townHall = hv.townHallLevel;
  const sum = (id: string, field: "capacity" | "productionRate") => {
    const building = resourceBuildings.get(id);
    if (!building) return 0;
    return (hv.resourceBuildings[id] ?? []).reduce((total, instance) => {
      if (instance.level === 0) return total;
      const level = building.levels.find((candidate) => candidate.level === instance.level && (candidate.townHallRequired ?? 0) <= townHall);
      return total + (level?.[field] ?? 0);
    }, 0);
  };
  const base = townHallStorage.find((level) => level.level === townHall)?.storageCapacity;
  const rows: ResourceRow[] = [
    { id: "gold", label: "Gold", image: "/images/other/gold.png", perHour: sum("gold-mine", "productionRate"), storage: sum("gold-storage", "capacity") + (base?.gold ?? 0) },
    { id: "elixir", label: "Elixir", image: "/images/other/elixir.png", perHour: sum("elixir-collector", "productionRate"), storage: sum("elixir-storage", "capacity") + (base?.elixir ?? 0) },
    { id: "darkElixir", label: "Dark Elixir", image: "/images/other/dark-elixir.png", perHour: sum("dark-elixir-drill", "productionRate"), storage: sum("dark-elixir-storage", "capacity") + (base?.darkElixir ?? 0) },
  ];
  return rows.filter((row) => row.perHour > 0 || row.storage > 0);
};

export const daysAtTownHall = (village: Playthrough) => calcDaysAt(village.thChangedAt);
