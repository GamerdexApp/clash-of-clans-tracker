/**
 * Pure data helpers for the Clan Capital Mass Edit page.
 * No React imports — safe to call from useMemo or module scope.
 */

import { clanCapital } from "clash-of-clans-data";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { BuildingEditData, ItemEditData, WallLevelData } from "./massEditHelpers";

// Module-level singleton
const _cap = clanCapital() as any;


type RawCapBuilding = {
  id: string;
  name: string;
  levels: Array<{
    level: number;
    capitalHallRequired?: number;
    districtHallRequired?: number;
    images?: { normal?: string };
  }>;
  availablePerCapitalHall?: Array<{ capitalHallLevel: number; count: number }>;
  availablePerDistrict?: Array<{ district: string; countPerDistrictHall: number[] }>;
};

const countAtCapitalHall = (
  availablePerCapitalHall: Array<{ capitalHallLevel: number; count: number }>,
  capitalHallLevel: number
): number  => {
  let count = 0;
  for (const entry of availablePerCapitalHall) {
    if (entry.capitalHallLevel <= capitalHallLevel) count = entry.count;
  }
  return count;
}

const countAtDistrictHall = (
  availablePerDistrict: Array<{ district: string; countPerDistrictHall: number[] }>,
  districtId: string,
  dhLevel: number
): number  => {
  const entry = availablePerDistrict.find((d) => d.district === districtId);
  if (!entry) return 0;
  // countPerDistrictHall is 0-indexed: index 0 = DH level 1
  return entry.countPerDistrictHall[dhLevel - 1] ?? 0;
}

export const getCapitalPeakBuildings = (capitalHallLevel: number): BuildingEditData[]  => {
  const raw = _cap.defenses().get() as RawCapBuilding[];
  const result: BuildingEditData[] = [];

  for (const b of raw) {
    if (!b.availablePerCapitalHall?.length) continue;
    const instanceCount = countAtCapitalHall(b.availablePerCapitalHall, capitalHallLevel);
    if (instanceCount === 0) continue;
    const eligibleLevels = b.levels.filter(
      (l) => (l.capitalHallRequired ?? 0) <= capitalHallLevel
    );
    const maxLevel = eligibleLevels.length;
    if (maxLevel === 0) continue;
    const imageUrl = eligibleLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(eligibleLevels[maxLevel - 1].images!.normal!)
      : "";
    result.push({ id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 });
  }

  return result;
}

export const getDistrictBuildings = (districtId: string, dhLevel: number): BuildingEditData[]  => {
  if (dhLevel === 0) return [];
  const raw = _cap.defenses().get() as RawCapBuilding[];
  const result: BuildingEditData[] = [];

  for (const b of raw) {
    if (!b.availablePerDistrict?.length) continue;
    const instanceCount = countAtDistrictHall(b.availablePerDistrict, districtId, dhLevel);
    if (instanceCount === 0) continue;
    const eligibleLevels = b.levels.filter(
      (l) => (l.districtHallRequired ?? 0) <= dhLevel
    );
    const maxLevel = eligibleLevels.length;
    if (maxLevel === 0) continue;
    const imageUrl = eligibleLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(eligibleLevels[maxLevel - 1].images!.normal!)
      : "";
    result.push({ id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 });
  }

  return result;
}

export const getCapitalPeakTraps = (capitalHallLevel: number): BuildingEditData[]  => {
  if (capitalHallLevel === 0) return [];
  const raw = _cap.traps().get() as RawCapBuilding[];
  const result: BuildingEditData[] = [];

  for (const b of raw) {
    if (!b.availablePerCapitalHall?.length) continue;
    const instanceCount = countAtCapitalHall(b.availablePerCapitalHall, capitalHallLevel);
    if (instanceCount === 0) continue;
    const eligibleLevels = b.levels.filter(
      (l) => (l.capitalHallRequired ?? 0) <= capitalHallLevel
    );
    const maxLevel = eligibleLevels.length;
    if (maxLevel === 0) continue;
    const imageUrl = eligibleLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(eligibleLevels[maxLevel - 1].images!.normal!)
      : "";
    result.push({ id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 });
  }

  return result;
}

export const getDistrictTraps = (districtId: string, dhLevel: number): BuildingEditData[]  => {
  if (dhLevel === 0) return [];
  const raw = _cap.traps().get() as RawCapBuilding[];
  const result: BuildingEditData[] = [];

  for (const b of raw) {
    if (!b.availablePerDistrict?.length) continue;
    const instanceCount = countAtDistrictHall(b.availablePerDistrict, districtId, dhLevel);
    if (instanceCount === 0) continue;
    const eligibleLevels = b.levels.filter(
      (l) => (l.districtHallRequired ?? 0) <= dhLevel
    );
    const maxLevel = eligibleLevels.length;
    if (maxLevel === 0) continue;
    const imageUrl = eligibleLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(eligibleLevels[maxLevel - 1].images!.normal!)
      : "";
    result.push({ id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 });
  }

  return result;
}

/** Army camp, barracks, and spell factories per district. */
export const getDistrictArmyBuildings = (districtId: string, dhLevel: number): BuildingEditData[]  => {
  if (dhLevel === 0) return [];
  const raw = [
    ...(_cap.armyBuildings().get() as RawCapBuilding[]),
    ...(_cap.armyBuildings().barracks().get() as RawCapBuilding[]),
    ...(_cap.armyBuildings().spellFactories().get() as RawCapBuilding[]),
  ];
  const result: BuildingEditData[] = [];

  for (const b of raw) {
    if (!b.availablePerDistrict?.length) continue;
    const instanceCount = countAtDistrictHall(b.availablePerDistrict, districtId, dhLevel);
    if (instanceCount === 0) continue;
    const eligibleLevels = b.levels.filter(
      (l) => (l.districtHallRequired ?? 0) <= dhLevel
    );
    const maxLevel = eligibleLevels.length;
    if (maxLevel === 0) continue;
    const imageUrl = eligibleLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(eligibleLevels[maxLevel - 1].images!.normal!)
      : "";
    result.push({ id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 });
  }

  return result;
}

/**
 * Returns the Capital Hall level required to unlock each district.
 * Derived from districtHall level-1 `capitalHallRequired` data.
 * `capitalPeak` is always 1.
 */
export const getDistrictUnlockLevels = (): Record<string, number>  => {
  type RawDH = { levels: Array<{ capitalHallRequired?: Record<string, number> }> };
  const raw = _cap.districtHall().get() as RawDH[];
  const reqs = raw[0]?.levels[0]?.capitalHallRequired ?? {};
  return { capitalPeak: 1, ...reqs };
}

/** Highest Capital Hall level present in building data. */
export const getMaxCapitalHallLevel = (): number  => {
  const raw = _cap.defenses().get() as RawCapBuilding[];
  let max = 1;
  for (const b of raw) {
    if (!b.availablePerCapitalHall?.length) continue;
    for (const entry of b.availablePerCapitalHall) {
      max = Math.max(max, entry.capitalHallLevel);
    }
  }
  return max;
}

/** Highest District Hall level for a given district, derived from building data. */
export const getMaxDistrictHallLevel = (districtId: string): number  => {
  const raw = _cap.defenses().get() as RawCapBuilding[];
  let max = 0;
  for (const b of raw) {
    if (!b.availablePerDistrict?.length) continue;
    const entry = b.availablePerDistrict.find((d) => d.district === districtId);
    if (entry) max = Math.max(max, entry.countPerDistrictHall.length);
  }
  return max || 5;
}

export interface CapitalWallInfo {
  maxLevel: number;
  totalCount: number;
  levels: WallLevelData[];
}

type RawWall = {
  levels: Array<{ level: number; capitalHallRequired?: number; districtHallRequired?: number; images?: { normal?: string } }>;
  availablePerCapitalHall?: Array<{ capitalHallLevel: number; count: number }>;
  availablePerDistrict?: Array<{ district: string; countPerDistrictHall: number[] }>;
};

const getWallData = (): RawWall | null  => {
  const raw = _cap.walls().get() as RawWall[];
  return raw[0] ?? null;
}

export const getCapitalPeakWalls = (capitalHallLevel: number): CapitalWallInfo  => {
  if (capitalHallLevel === 0) return { maxLevel: 0, totalCount: 0, levels: [] };
  const wall = getWallData();
  if (!wall) return { maxLevel: 0, totalCount: 0, levels: [] };
  const totalCount = countAtCapitalHall(wall.availablePerCapitalHall ?? [], capitalHallLevel);
  const eligible = wall.levels.filter((l) => (l.capitalHallRequired ?? 0) <= capitalHallLevel);
  return {
    maxLevel: eligible.length,
    totalCount,
    levels: eligible.map((l) => ({
      level: l.level,
      imageUrl: l.images?.normal ? toPublicImageUrl(l.images.normal) : "",
    })),
  };
}

export const getDistrictWalls = (districtId: string, dhLevel: number): CapitalWallInfo  => {
  if (dhLevel === 0) return { maxLevel: 0, totalCount: 0, levels: [] };
  const wall = getWallData();
  if (!wall) return { maxLevel: 0, totalCount: 0, levels: [] };
  const totalCount = countAtDistrictHall(wall.availablePerDistrict ?? [], districtId, dhLevel);
  const eligible = wall.levels.filter((l) => (l.districtHallRequired ?? 0) <= dhLevel);
  return {
    maxLevel: eligible.length,
    totalCount,
    levels: eligible.map((l) => ({
      level: l.level,
      imageUrl: l.images?.normal ? toPublicImageUrl(l.images.normal) : "",
    })),
  };
}

type RawBarracks = {
  troopUnlocked?: string;
  availablePerDistrict?: Array<{ district: string }>;
};
type RawSpellFactory = {
  spellUnlocked?: string;
  availablePerDistrict?: Array<{ district: string }>;
};

const buildTroopDistrictMap = (): Record<string, string>  => {
  const barracks = _cap.armyBuildings().barracks().get() as RawBarracks[];
  const map: Record<string, string> = {};
  for (const b of barracks) {
    if (b.troopUnlocked && b.availablePerDistrict?.[0]?.district) {
      map[b.troopUnlocked] = b.availablePerDistrict[0].district;
    }
  }
  return map;
}

const buildSpellDistrictMap = (): Record<string, string>  => {
  const factories = _cap.armyBuildings().spellFactories().get() as RawSpellFactory[];
  const map: Record<string, string> = {};
  for (const f of factories) {
    if (f.spellUnlocked && f.availablePerDistrict?.[0]?.district) {
      map[f.spellUnlocked] = f.availablePerDistrict[0].district;
    }
  }
  return map;
}

const TROOP_DISTRICT_MAP = buildTroopDistrictMap();
const SPELL_DISTRICT_MAP = buildSpellDistrictMap();

/**
 * Returns only the troops available at the current district hall levels,
 * with maxLevel capped to what the troop's home district can actually reach.
 */
export const getCapitalTroops = (districtHallLevels: Record<string, number>): ItemEditData[]  => {
  type RawTroop = {
    name: string;
    levels: Array<{ level: number; districtHallRequired?: number }>;
    images?: { icon?: string };
  };
  const troopsObj = _cap.troops();
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(troopsObj)).filter(
    (m) => m !== "constructor"
  );
  const result: ItemEditData[] = [];
  for (const method of methods) {
    const t: RawTroop = troopsObj[method]().data[0];
    const district = TROOP_DISTRICT_MAP[t.name];
    const dhLevel = district ? (districtHallLevels[district] ?? 0) : 0;
    const eligible = t.levels.filter((l) => (l.districtHallRequired ?? 0) <= dhLevel);
    if (eligible.length === 0) continue;
    result.push({
      name: t.name,
      maxLevel: eligible[eligible.length - 1].level,
      imageUrl: t.images?.icon ? toPublicImageUrl(t.images.icon) : "",
    });
  }
  return result;
}

/**
 * Returns only the spells available at the current district hall levels,
 * with maxLevel capped to what the spell's home district can actually reach.
 */
export const getCapitalSpells = (districtHallLevels: Record<string, number>): ItemEditData[]  => {
  type RawSpell = {
    name: string;
    levels: Array<{ level: number; districtHallRequired?: number; images?: { normal?: string } }>;
  };
  const spellsObj = _cap.spells();
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(spellsObj)).filter(
    (m) => m !== "constructor"
  );
  const result: ItemEditData[] = [];
  for (const method of methods) {
    const s: RawSpell = spellsObj[method]().data[0];
    const district = SPELL_DISTRICT_MAP[s.name];
    const dhLevel = district ? (districtHallLevels[district] ?? 0) : 0;
    const eligible = s.levels.filter((l) => (l.districtHallRequired ?? 0) <= dhLevel);
    if (eligible.length === 0) continue;
    result.push({
      name: s.name,
      maxLevel: eligible[eligible.length - 1].level,
      imageUrl: eligible[0]?.images?.normal ? toPublicImageUrl(eligible[0].images!.normal!) : "",
    });
  }
  return result;
}

export interface CapitalArmyCatalogEntry {
  name: string;
  kind: "troops" | "spells";
  imageUrl: string;
  /** The zone whose District Hall unlocks this troop or spell, or null when the data names none. */
  district: string | null;
  /** The District Hall level each level needs, lowest level first. */
  levels: Array<{ level: number; districtHallRequired: number }>;
}

/** Every Clan Capital troop and spell, whether or not the village can use it yet. */
export const getCapitalArmyCatalog = (): CapitalArmyCatalogEntry[]  => {
  type RawItem = {
    name: string;
    levels: Array<{ level: number; districtHallRequired?: number; images?: { normal?: string } }>;
    images?: { icon?: string };
  };
  const read = (source: any, kind: "troops" | "spells", districts: Record<string, string>) =>
    Object.getOwnPropertyNames(Object.getPrototypeOf(source))
      .filter((method) => method !== "constructor")
      .map((method): CapitalArmyCatalogEntry => {
        const item: RawItem = source[method]().data[0];
        const icon = item.images?.icon ?? item.levels[0]?.images?.normal;
        return {
          name: item.name,
          kind,
          imageUrl: icon ? toPublicImageUrl(icon) : "",
          district: districts[item.name] ?? null,
          levels: item.levels.map((l) => ({ level: l.level, districtHallRequired: l.districtHallRequired ?? 0 })),
        };
      });
  return [...read(_cap.troops(), "troops", TROOP_DISTRICT_MAP), ...read(_cap.spells(), "spells", SPELL_DISTRICT_MAP)];
}
