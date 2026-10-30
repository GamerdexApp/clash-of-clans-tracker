import type { BuilderTarget, UpgradeTarget } from "./engine";
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

/** What the Add flyout lists for any queue: one thing and the levels a player can still queue for it. */
export interface AvailableGroup {
  key: string;
  target: UpgradeTarget;
  name: string;
  imageUrl: string;
  category: string;
  /** The level that marks a locked item as unlocked, when the first level is not 1. */
  unlockLevel?: number;
  /** Steps that are not running and not queued yet, lowest level first. */
  steps: UpgradeStep[];
}

export interface UpgradeGroup extends AvailableGroup {
  target: BuilderTarget;
  category: AvailableCategory;
}

export type ResearchCategory = "troops" | "spells" | "siegeMachines" | "pets";

/** Research and pets at level 0 are not unlocked yet, so they have no steps to queue. */
export interface ResearchAvailability {
  groups: AvailableGroup[];
  locked: AvailableGroup[];
}
