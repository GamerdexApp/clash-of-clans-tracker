import { builder, home } from "clash-of-clans-data";

import { formatNumber } from "@/lib/format";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { blacksmithLevel } from "./equipment";
import { heroIdForName } from "./upgradeEngine";
import {
  calcBuilderHeroesProgress,
  calcBuilderLabProgress,
  calcBuilderStructuresProgress,
  calcBuilderTrapsProgress,
  calcBuilderWallsProgress,
  getBuilderWallData,
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
import { capitalArmy, capitalHallOf, zoneHall, zoneIsOpen, zoneLabel, zoneProgress, zoneUnlockLevel, capitalZones } from "./capital";
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

const BUILDER_BASE_TOWN_HALL = 6;

export type BuilderBaseState = "locked" | "notSet" | "open";

/** Builder Base needs Town Hall 6 or a Builder Hall. A Builder Hall of 0 asks for the level instead of showing empty progress. */
export const builderBaseState = (village: Playthrough): BuilderBaseState => {
  const builderHall = village.data.builderBase.builderHallLevel;
  if (builderHall > 0) return "open";
  return village.data.homeVillage.townHallLevel >= BUILDER_BASE_TOWN_HALL ? "notSet" : "locked";
};

export const builderProgressCards = (village: Playthrough): ProgressCardData[] => {
  const bb = village.data.builderBase;
  const hall = bb.builderHallLevel;
  const walls = getBuilderWallData(hall);
  return [
    { id: "structures", label: "Structures", result: calcBuilderStructuresProgress(bb, hall), sub: "Defenses, army, resources", href: "/builder-base/upgrades" },
    { id: "traps", label: "Traps", result: calcBuilderTrapsProgress(bb, hall), href: "/builder-base/upgrades?tab=traps" },
    { id: "lab", label: "Lab", result: calcBuilderLabProgress(bb, hall), sub: "Builder troops", href: "/builder-base/troops" },
    { id: "heroes", label: "Heroes", result: calcBuilderHeroesProgress(bb.heroes, hall), href: "/builder-base/upgrades?tab=heroes" },
    {
      id: "walls",
      label: "Walls",
      result: calcBuilderWallsProgress(bb.walls ?? {}, hall),
      sub: walls.totalAtBH > 0 ? `${walls.totalAtBH} walls, max level ${walls.maxLevel}` : undefined,
      href: "/builder-base/walls",
    },
  ];
};

const builderRaw = builder() as unknown as Record<"troops" | "heroes", () => { get: () => RawEntry[] }>;
const allBuilderTroops = builderRaw.troops().get();
const allBuilderHeroes = builderRaw.heroes().get();

interface RawBuilderLevel extends RawLevel {
  starLabRequired?: number;
  builderHallLevelRequired?: number;
}

export interface BuilderItemGroups {
  troops: ItemTileData[];
  heroes: ItemTileData[];
}

/** Every Builder Base troop and hero, locked with what it needs when the Builder Hall or Star Laboratory is too low. */
export const builderItemGroups = (village: Playthrough, now: Date): BuilderItemGroups => {
  const bb = village.data.builderBase;
  const hall = bb.builderHallLevel;
  const troops = savedByName(bb.troops);
  const heroes = savedByName(bb.heroes);
  return {
    troops: allBuilderTroops.map((entry) => {
      const levels = entry.levels as RawBuilderLevel[];
      const maxLevel = levels.filter((level) => (level.starLabRequired ?? 0) <= hall).length;
      return tileFor(entry, troops.get(entry.name.toLowerCase()), maxLevel, `Star Laboratory ${levels[0]?.starLabRequired ?? 1}`, now);
    }),
    heroes: allBuilderHeroes.map((entry) => {
      const levels = entry.levels as RawBuilderLevel[];
      const maxLevel = levels.filter((level) => (level.builderHallLevelRequired ?? 0) <= hall).length;
      return tileFor(entry, heroes.get(entry.name.toLowerCase()), maxLevel, `Builder Hall ${levels[0]?.builderHallLevelRequired ?? 1}`, now);
    }),
  };
};

const builderResourceBuildings = new Map(
  (builder().resourceBuildings().get() as unknown as Array<{ id: string; levels: Array<{ level: number; capacity?: number; productionRate?: number; builderHallRequired?: number }> }>).map((building) => [building.id, building]),
);

export const builderResources = (village: Playthrough): ResourceRow[] => {
  const bb = village.data.builderBase;
  const sum = (id: string, field: "capacity" | "productionRate") => {
    const building = builderResourceBuildings.get(id);
    if (!building) return 0;
    return (bb.resourceBuildings[id] ?? []).reduce((total, instance) => {
      if (instance.level === 0) return total;
      const level = building.levels.find((candidate) => candidate.level === instance.level && (candidate.builderHallRequired ?? 0) <= bb.builderHallLevel);
      return total + (level?.[field] ?? 0);
    }, 0);
  };
  const rows: ResourceRow[] = [
    { id: "gold", label: "Builder Gold", image: "/images/other/gold-b.png", perHour: sum("gold-mine", "productionRate"), storage: sum("gold-storage", "capacity") },
    { id: "elixir", label: "Builder Elixir", image: "/images/other/elixir-b.png", perHour: sum("elixir-collector", "productionRate"), storage: sum("elixir-storage", "capacity") },
  ];
  return rows.filter((row) => row.perHour > 0 || row.storage > 0);
};

export const daysAtBuilderHall = (village: Playthrough) => calcDaysAt(village.bhChangedAt);

export type ClanCapitalOverviewState = "locked" | "off" | "notSet" | "open";

export const capitalOverviewState = (village: Playthrough): ClanCapitalOverviewState => {
  const state = clanCapitalState(village);
  if (state !== "on") return state;
  return capitalHallOf(village) > 0 ? "open" : "notSet";
};

export interface DistrictCardData {
  id: string;
  label: string;
  hallLevel: number;
  open: boolean;
  unlocksAt: number;
  /** The Capital Hall opens the zone, but its District Hall is still 0. */
  needsDistrictHall: boolean;
  progress: ProgressResult;
  isCapital: boolean;
}

const floorResult = (current: number, max: number): ProgressResult =>
  max <= 0 ? { current, max: 0, pct: 0 } : { current, max, pct: current >= max ? 100 : Math.floor((current / max) * 100) };

export interface CapitalOverview {
  cards: ProgressCardData[];
  districts: DistrictCardData[];
}

/** Three progress cards and one card per zone. Progress rounds down like every other section. */
export const capitalOverview = (village: Playthrough): CapitalOverview => {
  const zones = capitalZones.map((zone): DistrictCardData => {
    const hallLevel = zoneHall(village, zone.id);
    const progress = zoneProgress(village, zone.id);
    return {
      id: zone.id,
      label: zone.id === "capitalPeak" ? "Capital Peak" : zoneLabel(zone.id),
      hallLevel,
      open: zoneIsOpen(village, zone.id) && hallLevel > 0,
      unlocksAt: zoneUnlockLevel(zone.id),
      needsDistrictHall: zoneIsOpen(village, zone.id) && hallLevel === 0,
      progress: floorResult(progress.current, progress.max),
      isCapital: zone.id === "capitalPeak",
    };
  });
  const districts = zones.filter((zone) => !zone.isCapital);
  const activeDistricts = districts.filter((zone) => zone.open).length;
  const army = capitalArmy(village).filter((entry) => entry.maxLevel > 0);
  const sum = (kind: "troops" | "spells") => {
    const entries = army.filter((entry) => entry.kind === kind);
    return { count: entries.length, result: floorResult(entries.reduce((total, entry) => total + Math.min(entry.level, entry.maxLevel), 0), entries.reduce((total, entry) => total + entry.maxLevel, 0)) };
  };
  const troops = sum("troops");
  const spells = sum("spells");
  return {
    cards: [
      { id: "districts", label: "Districts", result: floorResult(activeDistricts, districts.length), sub: `${activeDistricts} of ${districts.length} active`, href: "/clan-capital/districts" },
      { id: "troops", label: "Troops", result: troops.result, sub: `${troops.count} available`, href: "/clan-capital/troops" },
      { id: "spells", label: "Spells", result: spells.result, sub: `${spells.count} available`, href: "/clan-capital/troops" },
    ],
    districts: zones,
  };
};
