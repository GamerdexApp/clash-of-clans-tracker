import type { UpgradeTarget } from "./engine";
import type { UpgradeStep } from "./upgrade";

export type AvailableCategory =
  | "defenses"
  | "armyBuildings"
  | "resourceBuildings"
  | "traps"
  | "heroes"
  | "townHall"
  | "craftedDefenses"
  | "guardians"
  | "supercharges";

export interface UpgradeGroup {
  key: string;
  target: UpgradeTarget;
  name: string;
  imageUrl: string;
  category: AvailableCategory;
  /** Steps that are not running and not queued yet, lowest level first. */
  steps: UpgradeStep[];
}
