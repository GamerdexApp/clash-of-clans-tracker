import type { WallLevel, WallPrice } from "@/types/app/walls";

export interface WallRowProps {
  level: WallLevel;
  count: number;
  /** The most walls this level can hold now. */
  maxCount: number;
  highest: number;
  townHall: number;
  /** The cost of one wall to the next level, or null on the top level. */
  nextCost: WallPrice | null;
  onMove: (from: number, to: number, count: number) => void;
  onSetCount: (level: number, count: number) => void;
}
