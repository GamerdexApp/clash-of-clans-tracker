import type { WallLevel, WallPrice, WallRules } from "@/types/app/walls";

export interface WallRowProps {
  rules: WallRules;
  level: WallLevel;
  count: number;
  /** The most walls this level can hold now. */
  maxCount: number;
  highest: number;
  /** The Town Hall or Builder Hall level. */
  hall: number;
  /** The cost of one wall to the next level, or null on the top level. */
  nextCost: WallPrice | null;
  onMove: (from: number, to: number, count: number) => void;
  onSetCount: (level: number, count: number) => void;
}
