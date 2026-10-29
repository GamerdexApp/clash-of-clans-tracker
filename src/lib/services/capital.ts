import { clanCapital } from "clash-of-clans-data";

import { DISTRICTS, type DistrictKey } from "@/lib/constants/capitalDistricts";
import {
  getCapitalArmyCatalog,
  getCapitalPeakBuildings,
  getCapitalPeakTraps,
  getCapitalPeakWalls,
  getDistrictArmyBuildings,
  getDistrictBuildings,
  getDistrictTraps,
  getDistrictUnlockLevels,
  getDistrictWalls,
  type CapitalWallInfo,
} from "@/lib/utils/massEditCapitalHelpers";
import type { BuildingEditData } from "@/lib/utils/massEditHelpers";
import type { Playthrough } from "@/types/app";
import type { CapitalBuildingRecord, ClanCapitalDistrictData, TrackedItem } from "@/types/app/game";
import type { CapitalArmyEntry, CapitalGroup, CapitalZone, ZoneId } from "@/types/app/capital";

interface RawHall {
  levels: Array<{ level: number; buildCost: number; capitalHallRequired?: Record<string, number> }>;
}

const capital = clanCapital() as unknown as {
  capitalHall: () => { get: () => RawHall[] };
  districtHall: () => { get: () => RawHall[] };
};
const capitalHallLevels = capital.capitalHall().get()[0].levels;
const districtHallLevels = capital.districtHall().get()[0].levels;
const unlockLevels = getDistrictUnlockLevels();

export const capitalZones: CapitalZone[] = [
  { id: "capitalPeak", label: "Capital Peak" },
  ...DISTRICTS.map((district) => ({ id: district.id, label: district.label })),
];

export const zoneLabel = (zoneId: ZoneId) => capitalZones.find((zone) => zone.id === zoneId)?.label ?? zoneId;

export const maxCapitalHall = capitalHallLevels.at(-1)?.level ?? 0;

export const zoneData = (village: Playthrough, zoneId: ZoneId): ClanCapitalDistrictData =>
  village.data.clanCapital[zoneId];

export const capitalHallOf = (village: Playthrough) => village.data.clanCapital.capitalPeak.hallLevel;

export const zoneHall = (village: Playthrough, zoneId: ZoneId) => zoneData(village, zoneId).hallLevel;

/** The Capital Hall level a zone needs before it opens. Capital Peak opens with the Capital Hall. */
export const zoneUnlockLevel = (zoneId: ZoneId): number => unlockLevels[zoneId] ?? 1;

export const zoneOpensAt = (capitalHall: number) =>
  capitalZones.filter((zone) => zone.id !== "capitalPeak" && zoneUnlockLevel(zone.id) === capitalHall).map((zone) => zone.label);

/** What raising the Capital Hall to this level costs, in Capital Gold. */
export const capitalHallCost = (level: number) => capitalHallLevels.find((entry) => entry.level === level)?.buildCost ?? 0;

/** The District Hall level a zone reaches at most, and the highest one this Capital Hall allows. */
export const maxDistrictHall = (zoneId: ZoneId, capitalHall: number): number =>
  districtHallLevels
    .filter((entry) => (entry.capitalHallRequired?.[zoneId] ?? Number.POSITIVE_INFINITY) <= capitalHall)
    .at(-1)?.level ?? 0;

export const districtHallRequirement = (zoneId: ZoneId, level: number): number | null =>
  districtHallLevels.find((entry) => entry.level === level)?.capitalHallRequired?.[zoneId] ?? null;

export const topDistrictHall = (zoneId: ZoneId): number =>
  districtHallLevels.filter((entry) => entry.capitalHallRequired?.[zoneId] !== undefined).at(-1)?.level ?? 0;

export const zoneIsOpen = (village: Playthrough, zoneId: ZoneId) => capitalHallOf(village) >= zoneUnlockLevel(zoneId);

export const groupBuildings = (zoneId: ZoneId, hall: number, group: Exclude<CapitalGroup, "walls">): BuildingEditData[] => {
  if (zoneId === "capitalPeak") {
    if (group === "defenses") return getCapitalPeakBuildings(hall);
    return group === "traps" ? getCapitalPeakTraps(hall) : [];
  }
  if (group === "defenses") return getDistrictBuildings(zoneId, hall);
  return group === "traps" ? getDistrictTraps(zoneId, hall) : getDistrictArmyBuildings(zoneId, hall);
};

export const zoneWalls = (zoneId: ZoneId, hall: number): CapitalWallInfo =>
  zoneId === "capitalPeak" ? getCapitalPeakWalls(hall) : getDistrictWalls(zoneId, hall);

const allBuildings = (zoneId: ZoneId, hall: number): BuildingEditData[] => [
  ...groupBuildings(zoneId, hall, "defenses"),
  ...groupBuildings(zoneId, hall, "traps"),
  ...groupBuildings(zoneId, hall, "army"),
];

/** A level per instance, padded with 0 for instances never set. */
export const buildingLevels = (village: Playthrough, zoneId: ZoneId, building: BuildingEditData): number[] => {
  const saved = zoneData(village, zoneId).buildings[building.id] ?? [];
  return Array.from({ length: building.instanceCount }, (_, index) => saved[index] ?? 0);
};

export const wallCountAt = (village: Playthrough, zoneId: ZoneId, level: number) =>
  zoneData(village, zoneId).walls?.[String(level)] ?? 0;

export const placedWalls = (village: Playthrough, zoneId: ZoneId) =>
  Object.values(zoneData(village, zoneId).walls ?? {}).reduce((sum, count) => sum + count, 0);

const withZone = (village: Playthrough, zoneId: ZoneId, zone: ClanCapitalDistrictData): Playthrough => ({
  ...village,
  data: { ...village.data, clanCapital: { ...village.data.clanCapital, [zoneId]: zone } },
});

const withBuildings = (village: Playthrough, zoneId: ZoneId, buildings: CapitalBuildingRecord) =>
  withZone(village, zoneId, { ...zoneData(village, zoneId), buildings });

export const setBuildingLevel = (
  village: Playthrough,
  zoneId: ZoneId,
  building: BuildingEditData,
  instanceIndex: number,
  level: number,
): Playthrough => {
  const levels = buildingLevels(village, zoneId, building);
  levels[instanceIndex] = Math.max(0, Math.min(Math.floor(level), building.maxLevel));
  return withBuildings(village, zoneId, { ...zoneData(village, zoneId).buildings, [building.id]: levels });
};

/** Max sets every instance in the group to its top level. Clear sets them to 0. */
export const setGroupLevels = (
  village: Playthrough,
  zoneId: ZoneId,
  buildings: BuildingEditData[],
  to: "max" | "clear",
): Playthrough => {
  const next = { ...zoneData(village, zoneId).buildings };
  for (const building of buildings) {
    next[building.id] = Array.from({ length: building.instanceCount }, () => (to === "max" ? building.maxLevel : 0));
  }
  return withBuildings(village, zoneId, next);
};

/** A count that would pass the zone's wall total stops at what is left. Zero counts are kept. */
export const setWallCount = (village: Playthrough, zoneId: ZoneId, level: number, count: number): Playthrough => {
  const info = zoneWalls(zoneId, zoneHall(village, zoneId));
  const others = placedWalls(village, zoneId) - wallCountAt(village, zoneId, level);
  const next = Math.max(0, Math.min(Math.floor(count), info.totalCount - others));
  return withZone(village, zoneId, {
    ...zoneData(village, zoneId),
    walls: { ...zoneData(village, zoneId).walls, [String(level)]: next },
  });
};

export const setContributions = (village: Playthrough, amount: number): Playthrough => ({
  ...village,
  data: {
    ...village.data,
    clanCapital: { ...village.data.clanCapital, clanCapitalContributions: Math.max(0, Math.floor(amount)) },
  },
});

export const setTracking = (village: Playthrough, tracking: boolean): Playthrough => ({
  ...village,
  clanCapitalEnabled: tracking,
});

/** Keeps only what the new hall allows: fewer instances, lower levels, fewer walls. */
const fitZone = (zone: ClanCapitalDistrictData, zoneId: ZoneId, hall: number): ClanCapitalDistrictData => {
  const buildings: CapitalBuildingRecord = {};
  for (const building of allBuildings(zoneId, hall)) {
    const saved = zone.buildings[building.id];
    if (!saved) continue;
    buildings[building.id] = saved.slice(0, building.instanceCount).map((level) => Math.min(level, building.maxLevel));
  }

  const info = zoneWalls(zoneId, hall);
  const allowed = new Set(info.levels.map((level) => String(level.level)));
  let left = info.totalCount;
  const walls: Record<string, number> = {};
  for (const [level, count] of Object.entries(zone.walls ?? {}).sort(([a], [b]) => Number(a) - Number(b))) {
    if (!allowed.has(level)) continue;
    walls[level] = Math.min(count, left);
    left -= walls[level];
  }
  return { ...zone, hallLevel: hall, buildings, walls };
};

const describeLoss = (before: ClanCapitalDistrictData, after: ClanCapitalDistrictData, zoneId: ZoneId): string[] => {
  const lines: string[] = [];
  const names = new Map(allBuildings(zoneId, Math.max(before.hallLevel, after.hallLevel)).map((b) => [b.id, b.name]));
  for (const [id, levels] of Object.entries(before.buildings)) {
    const kept = after.buildings[id];
    const name = names.get(id) ?? id;
    const built = levels.filter((level) => level > 0).length;
    if (!kept) {
      if (built > 0) lines.push(`${name}: ${built} ${built === 1 ? "building" : "buildings"} removed`);
      continue;
    }
    levels.forEach((level, index) => {
      if (level <= 0) return;
      if (index >= kept.length) lines.push(`${name} #${index + 1} removed`);
      else if (kept[index] < level) lines.push(`${name} #${index + 1}: level ${level} to ${kept[index]}`);
    });
  }
  const placedBefore = Object.values(before.walls ?? {}).reduce((sum, count) => sum + count, 0);
  const placedAfter = Object.values(after.walls ?? {}).reduce((sum, count) => sum + count, 0);
  if (placedAfter < placedBefore) lines.push(`Walls: ${placedBefore - placedAfter} removed`);
  return lines;
};

export interface HallChange {
  village: Playthrough;
  /** What the change resets, by zone. Empty when raising or when nothing no longer fits. */
  resets: Array<{ zone: string; lines: string[] }>;
}

/** Raising never resets. Lowering keeps what still fits and lists what does not. */
export const changeZoneHall = (village: Playthrough, zoneId: ZoneId, level: number): HallChange => {
  const before = zoneData(village, zoneId);
  const after = fitZone(before, zoneId, level);
  const lines = describeLoss(before, after, zoneId);
  return {
    village: withZone(village, zoneId, after),
    resets: lines.length > 0 ? [{ zone: zoneLabel(zoneId), lines }] : [],
  };
};

/** Lowering the Capital Hall also lowers every District Hall it no longer allows. */
export const changeCapitalHall = (village: Playthrough, level: number): HallChange => {
  let current = changeZoneHall(village, "capitalPeak", level);
  const resets = [...current.resets];
  for (const district of DISTRICTS) {
    const key: DistrictKey = district.key;
    const allowed = maxDistrictHall(key, level);
    if (zoneHall(current.village, key) <= allowed) continue;
    const lowered = changeZoneHall(current.village, key, allowed);
    const lines = [`District Hall ${zoneHall(current.village, key)} to ${allowed}`, ...(lowered.resets[0]?.lines ?? [])];
    resets.push({ zone: district.label, lines });
    current = { village: lowered.village, resets };
  }
  return { village: current.village, resets };
};

/** Current and maximum building levels and walls in one zone, as floors of the saved total. */
export const zoneProgress = (village: Playthrough, zoneId: ZoneId): { current: number; max: number } => {
  const hall = zoneHall(village, zoneId);
  let current = 0;
  let max = 0;
  for (const building of allBuildings(zoneId, hall)) {
    max += building.maxLevel * building.instanceCount;
    current += buildingLevels(village, zoneId, building).reduce((sum, level) => sum + level, 0);
  }
  const info = zoneWalls(zoneId, hall);
  max += info.maxLevel * info.totalCount;
  current += Object.entries(zoneData(village, zoneId).walls ?? {}).reduce((sum, [level, count]) => sum + Number(level) * count, 0);
  return { current, max };
};

const armyCatalog = getCapitalArmyCatalog();

const savedLevel = (items: TrackedItem[], name: string) => items.find((item) => item.name === name)?.level ?? 0;

/** Every troop and spell with what the village allows now. A locked entry keeps its saved level. */
export const capitalArmy = (village: Playthrough): CapitalArmyEntry[] =>
  armyCatalog.map((entry) => {
    const district = entry.district as ZoneId | null;
    const hall = district ? zoneHall(village, district) : 0;
    const open = district !== null && zoneIsOpen(village, district);
    const allowed = open ? entry.levels.filter((level) => level.districtHallRequired <= hall) : [];
    const first = entry.levels[0]?.districtHallRequired ?? 1;
    return {
      name: entry.name,
      kind: entry.kind,
      imageUrl: entry.imageUrl,
      district: district ? zoneLabel(district) : "",
      level: savedLevel(village.data.clanCapital[entry.kind], entry.name),
      maxLevel: allowed.at(-1)?.level ?? 0,
      topLevel: entry.levels.at(-1)?.level ?? 0,
      requirement: allowed.length > 0 || !district ? null : { capitalHall: open ? null : zoneUnlockLevel(district), districtHall: first, zone: zoneLabel(district) },
    };
  });

/** Sets a saved level. A level above what the halls allow stops at the allowed top. */
export const setArmyLevel = (village: Playthrough, kind: "troops" | "spells", name: string, level: number): Playthrough => {
  const entry = capitalArmy(village).find((candidate) => candidate.kind === kind && candidate.name === name);
  if (!entry || entry.maxLevel === 0) return village;
  const next = Math.max(0, Math.min(Math.floor(level), entry.maxLevel));
  const items = village.data.clanCapital[kind];
  const updated = items.some((item) => item.name === name)
    ? items.map((item) => (item.name === name ? { ...item, level: next } : item))
    : [...items, { name, level: next }];
  return {
    ...village,
    data: { ...village.data, clanCapital: { ...village.data.clanCapital, [kind]: updated } },
  };
};
