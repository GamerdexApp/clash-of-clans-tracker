import type { Playthrough } from "@/types/app";

export interface WallLevel {
  level: number;
  /** The cost of one wall to reach this level from the level below. */
  cost: number;
  costResource: string;
  imageUrl: string;
  /** The Town Hall or Builder Hall level this wall level needs. */
  hallRequired: number;
}

export interface WallPrice {
  amount: number;
  resource: string;
}

export interface WallRules {
  hallLevel: (village: Playthrough) => number;
  wallLevelsAt: (hall: number) => WallLevel[];
  highestWallLevel: (hall: number) => number;
  totalWallsAt: (hall: number) => number;
  wallCount: (village: Playthrough, level: number) => number;
  placedWalls: (village: Playthrough) => number;
  /** Positive when walls are still to place, negative when the village holds more than the hall allows. */
  unplacedWalls: (village: Playthrough) => number;
  /** The lowest level that holds walls. With no walls placed it is the first level. */
  lowestPlacedLevel: (village: Playthrough) => number;
  /** The price of walls moving from one level to a higher one: every level in between is paid. */
  movePrice: (from: number, to: number, walls: number) => WallPrice;
  costToHighest: (village: Playthrough) => {
    rows: Array<{ level: number; walls: number; price: WallPrice }>;
    total: WallPrice;
  };
  /** Moves up to `count` walls from one level to a higher level, in one write. */
  moveWalls: (village: Playthrough, from: number, to: number, count: number) => Playthrough;
  maxCountFor: (village: Playthrough, level: number) => number;
  setWallCount: (village: Playthrough, level: number, count: number) => Playthrough;
}
