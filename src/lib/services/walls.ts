import { home } from "clash-of-clans-data";

import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { Playthrough } from "@/types/app";
import type { WallLevel, WallPrice } from "@/types/app/walls";

interface RawWall {
  levels: Array<{
    level: number;
    buildCost: number;
    buildCostResource: string;
    townHallRequired: number;
    images?: { normal?: string };
  }>;
  availablePerTownHall: Array<{ townHallLevel: number; count: number }>;
}

const raw = (home().walls().get() as unknown as RawWall[])[0];

const levels: WallLevel[] = raw.levels.map((level) => ({
  level: level.level,
  cost: level.buildCost,
  costResource: level.buildCostResource,
  imageUrl: level.images?.normal ? toPublicImageUrl(level.images.normal) : "",
  townHallRequired: level.townHallRequired,
}));

/** Every wall level the Town Hall allows, lowest first. */
export const wallLevelsAt = (townHall: number): WallLevel[] =>
  levels.filter((level) => level.townHallRequired <= townHall);

export const highestWallLevel = (townHall: number): number => wallLevelsAt(townHall).at(-1)?.level ?? 0;

export const totalWallsAt = (townHall: number): number =>
  raw.availablePerTownHall.filter((entry) => entry.townHallLevel <= townHall).at(-1)?.count ?? 0;

const countsOf = (village: Playthrough) => village.data.homeVillage.walls;

export const wallCount = (village: Playthrough, level: number): number => countsOf(village)[String(level)] ?? 0;

export const placedWalls = (village: Playthrough): number =>
  Object.values(countsOf(village)).reduce((sum, count) => sum + count, 0);

/** Positive when walls are still to place, negative when the village holds more than the Town Hall allows. */
export const unplacedWalls = (village: Playthrough): number =>
  totalWallsAt(village.data.homeVillage.townHallLevel) - placedWalls(village);

/** The lowest level that holds walls. With no walls placed it is the first level. */
export const lowestPlacedLevel = (village: Playthrough): number => {
  const townHall = village.data.homeVillage.townHallLevel;
  const available = wallLevelsAt(townHall);
  return available.find((level) => wallCount(village, level.level) > 0)?.level ?? available[0]?.level ?? 0;
};

/** The price of walls moving from one level to a higher one: every level in between is paid. */
export const movePrice = (from: number, to: number, walls: number): WallPrice => {
  const steps = levels.filter((level) => level.level > from && level.level <= to);
  const amount = steps.reduce((sum, step) => sum + step.cost, 0) * walls;
  const onlyGold = steps.every((step) => step.costResource === "Gold");
  return { amount, resource: steps.length === 0 || onlyGold ? "Gold" : "Gold or Elixir" };
};

/** The cost to bring every placed wall to the highest level. */
export const costToHighest = (village: Playthrough): { rows: Array<{ level: number; walls: number; price: WallPrice }>; total: WallPrice } => {
  const top = highestWallLevel(village.data.homeVillage.townHallLevel);
  const rows = wallLevelsAt(village.data.homeVillage.townHallLevel)
    .filter((level) => level.level < top && wallCount(village, level.level) > 0)
    .map((level) => ({
      level: level.level,
      walls: wallCount(village, level.level),
      price: movePrice(level.level, top, wallCount(village, level.level)),
    }));
  const amount = rows.reduce((sum, row) => sum + row.price.amount, 0);
  const onlyGold = rows.every((row) => row.price.resource === "Gold");
  return { rows, total: { amount, resource: onlyGold ? "Gold" : "Gold or Elixir" } };
};

const withCounts = (village: Playthrough, counts: Record<string, number>): Playthrough => ({
  ...village,
  data: { ...village.data, homeVillage: { ...village.data.homeVillage, walls: counts } },
});

/** A count of 0 removes the level from the record. */
const writeCount = (counts: Record<string, number>, level: number, count: number): Record<string, number> => {
  const next = { ...counts };
  if (count <= 0) delete next[String(level)];
  else next[String(level)] = count;
  return next;
};

/** Moves up to `count` walls from one level to a higher level, in one write. */
export const moveWalls = (village: Playthrough, from: number, to: number, count: number): Playthrough => {
  const moving = Math.min(count, wallCount(village, from));
  if (moving <= 0 || to <= from) return village;
  const lowered = writeCount(countsOf(village), from, wallCount(village, from) - moving);
  return withCounts(village, writeCount(lowered, to, (lowered[String(to)] ?? 0) + moving));
};

/** The most walls a level can hold: what it holds now plus the walls still to place. */
export const maxCountFor = (village: Playthrough, level: number): number =>
  Math.max(0, wallCount(village, level) + Math.max(0, unplacedWalls(village)));

/** Sets how many walls a level holds. A count that would pass the Town Hall total stops at what is left. */
export const setWallCount = (village: Playthrough, level: number, count: number): Playthrough =>
  withCounts(
    village,
    writeCount(countsOf(village), level, Math.min(Math.max(0, Math.floor(count)), maxCountFor(village, level))),
  );
