import { builder, home } from "clash-of-clans-data";

import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { Playthrough } from "@/types/app";
import type { WallLevel, WallPrice, WallRules } from "@/types/app/walls";

interface RawWall {
  levels: Array<{
    level: number;
    buildCost: number;
    buildCostResource: string;
    townHallRequired?: number;
    builderHallRequired?: number;
    images?: { normal?: string };
  }>;
  availablePerTownHall?: Array<{ townHallLevel: number; count: number }>;
  availablePerBuilderHall?: Array<{ builderHallLevel: number; count: number }>;
}

interface WallSide {
  raw: RawWall;
  /** Reads the level a wall asks of the hall. */
  hallRequired: (level: RawWall["levels"][number]) => number;
  totals: Array<{ hallLevel: number; count: number }>;
  hallLevel: (village: Playthrough) => number;
  counts: (village: Playthrough) => Record<string, number>;
  withCounts: (village: Playthrough, counts: Record<string, number>) => Playthrough;
  cheapResource: string;
  eitherResource: string;
}

const homeRaw = (home().walls().get() as unknown as RawWall[])[0];
const builderRaw = (builder().walls().get() as unknown as RawWall[])[0];

const homeSide: WallSide = {
  raw: homeRaw,
  hallRequired: (level) => level.townHallRequired ?? 0,
  totals: (homeRaw.availablePerTownHall ?? []).map((entry) => ({ hallLevel: entry.townHallLevel, count: entry.count })),
  hallLevel: (village) => village.data.homeVillage.townHallLevel,
  counts: (village) => village.data.homeVillage.walls,
  withCounts: (village, walls) => ({
    ...village,
    data: { ...village.data, homeVillage: { ...village.data.homeVillage, walls } },
  }),
  cheapResource: "Gold",
  eitherResource: "Gold or Elixir",
};

const builderSide: WallSide = {
  raw: builderRaw,
  hallRequired: (level) => level.builderHallRequired ?? 0,
  totals: (builderRaw.availablePerBuilderHall ?? []).map((entry) => ({
    hallLevel: entry.builderHallLevel,
    count: entry.count,
  })),
  hallLevel: (village) => village.data.builderBase.builderHallLevel,
  counts: (village) => village.data.builderBase.walls,
  withCounts: (village, walls) => ({
    ...village,
    data: { ...village.data, builderBase: { ...village.data.builderBase, walls } },
  }),
  cheapResource: "Builder Gold",
  eitherResource: "Builder Gold or Builder Elixir",
};

/** A count of 0 removes the level from the record. */
const writeCount = (counts: Record<string, number>, level: number, count: number): Record<string, number> => {
  const next = { ...counts };
  if (count <= 0) delete next[String(level)];
  else next[String(level)] = count;
  return next;
};

const createWallRules = (side: WallSide): WallRules => {
  const levels: WallLevel[] = side.raw.levels.map((level) => ({
    level: level.level,
    cost: level.buildCost,
    costResource: level.buildCostResource,
    imageUrl: level.images?.normal ? toPublicImageUrl(level.images.normal) : "",
    hallRequired: side.hallRequired(level),
  }));

  const labelFor = (onlyCheap: boolean) => (onlyCheap ? side.cheapResource : side.eitherResource);

  const wallLevelsAt = (hall: number) => levels.filter((level) => level.hallRequired <= hall);
  const highestWallLevel = (hall: number) => wallLevelsAt(hall).at(-1)?.level ?? 0;
  const totalWallsAt = (hall: number) => side.totals.filter((entry) => entry.hallLevel <= hall).at(-1)?.count ?? 0;

  const wallCount = (village: Playthrough, level: number) => side.counts(village)[String(level)] ?? 0;
  const placedWalls = (village: Playthrough) => Object.values(side.counts(village)).reduce((sum, count) => sum + count, 0);
  const unplacedWalls = (village: Playthrough) => totalWallsAt(side.hallLevel(village)) - placedWalls(village);

  const lowestPlacedLevel = (village: Playthrough) => {
    const available = wallLevelsAt(side.hallLevel(village));
    return available.find((level) => wallCount(village, level.level) > 0)?.level ?? available[0]?.level ?? 0;
  };

  const movePrice = (from: number, to: number, walls: number): WallPrice => {
    const steps = levels.filter((level) => level.level > from && level.level <= to);
    const amount = steps.reduce((sum, step) => sum + step.cost, 0) * walls;
    return { amount, resource: labelFor(steps.every((step) => step.costResource === side.cheapResource)) };
  };

  const costToHighest = (village: Playthrough) => {
    const hall = side.hallLevel(village);
    const top = highestWallLevel(hall);
    const rows = wallLevelsAt(hall)
      .filter((level) => level.level < top && wallCount(village, level.level) > 0)
      .map((level) => ({
        level: level.level,
        walls: wallCount(village, level.level),
        price: movePrice(level.level, top, wallCount(village, level.level)),
      }));
    const amount = rows.reduce((sum, row) => sum + row.price.amount, 0);
    return { rows, total: { amount, resource: labelFor(rows.every((row) => row.price.resource === side.cheapResource)) } };
  };

  const moveWalls = (village: Playthrough, from: number, to: number, count: number) => {
    const moving = Math.min(count, wallCount(village, from));
    if (moving <= 0 || to <= from) return village;
    const lowered = writeCount(side.counts(village), from, wallCount(village, from) - moving);
    return side.withCounts(village, writeCount(lowered, to, (lowered[String(to)] ?? 0) + moving));
  };

  /** The most walls a level can hold: what it holds now plus the walls still to place. */
  const maxCountFor = (village: Playthrough, level: number) =>
    Math.max(0, wallCount(village, level) + Math.max(0, unplacedWalls(village)));

  /** A count that would pass the hall total stops at what is left. */
  const setWallCount = (village: Playthrough, level: number, count: number) =>
    side.withCounts(
      village,
      writeCount(side.counts(village), level, Math.min(Math.max(0, Math.floor(count)), maxCountFor(village, level))),
    );

  return {
    hallLevel: side.hallLevel,
    wallLevelsAt,
    highestWallLevel,
    totalWallsAt,
    wallCount,
    placedWalls,
    unplacedWalls,
    lowestPlacedLevel,
    movePrice,
    costToHighest,
    moveWalls,
    maxCountFor,
    setWallCount,
  };
};

export const homeWalls = createWallRules(homeSide);
export const builderWalls = createWallRules(builderSide);

export const {
  wallLevelsAt,
  highestWallLevel,
  totalWallsAt,
  wallCount,
  placedWalls,
  unplacedWalls,
  lowestPlacedLevel,
  movePrice,
  costToHighest,
  moveWalls,
  maxCountFor,
  setWallCount,
} = homeWalls;
