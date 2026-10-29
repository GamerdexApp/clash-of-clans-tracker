import type { BuildingRecordKey, UpgradeState } from "./game";

export type UpgradeTarget =
  | { kind: "building"; record: BuildingRecordKey; buildingId: string; instanceIndex: number }
  | { kind: "hero"; name: string }
  | { kind: "townHall" }
  | { kind: "townHallWeapon" }
  | { kind: "crafted"; defenseId: string; moduleIndex: number };

export interface RunningUpgrade {
  target: UpgradeTarget;
  upgrade: UpgradeState;
}

export type FinishMethod = "timePassed" | "gems" | "book" | "hammer";

export type BoostPercent = 0 | 10 | 15 | 20;

export type SlotKind = "hut" | "bob" | "goblin";

export interface BuilderSlotState {
  id: number;
  label: string;
  kind: SlotKind;
  running: RunningUpgrade | null;
}

export interface BuilderSlots {
  slots: BuilderSlotState[];
  /** Running upgrades whose builder id has no built hut, B.O.B or enabled Goblin Builder. */
  unassigned: RunningUpgrade[];
}

export interface FinishResult<Village> {
  village: Village;
  timeSavedMs: number;
}

export interface CompletedUpgrade {
  target: UpgradeTarget;
  fromLevel: number;
  toLevel: number;
}

export type StartBlocker = "alreadyRunning" | "noSuchBuilder" | "builderBusy" | "maxLevel";
