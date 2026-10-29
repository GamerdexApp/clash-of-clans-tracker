import type { BuildingRecordKey, ResearchKey, UpgradeState } from "./game";

export type UpgradeTarget =
  | { kind: "building"; record: BuildingRecordKey; buildingId: string; instanceIndex: number }
  | { kind: "hero"; name: string }
  | { kind: "townHall" }
  | { kind: "townHallWeapon" }
  | { kind: "crafted"; defenseId: string; moduleIndex: number }
  | { kind: "research"; record: ResearchKey; name: string }
  | { kind: "pet"; name: string }
  | { kind: "bbBuilding"; record: BuildingRecordKey; buildingId: string; instanceIndex: number }
  | { kind: "bbHero"; name: string }
  | { kind: "clockTower" }
  | { kind: "builderHall" }
  | { kind: "bbTroop"; name: string };

/** The targets a builder works on. Research and pets wait on the Laboratory and the Pet House. */
export type BuilderTarget = Exclude<UpgradeTarget, { kind: "research" | "pet" | "bbBuilding" | "bbHero" | "clockTower" | "builderHall" | "bbTroop" }>;

/** The queue of workers an upgrade waits on: builders, the Laboratory or the Pet House. */
export type LaneKind = "builder" | "research" | "pet";

/** Every queue of workers an upgrade can wait on. Only the first three have queue pages so far. */
export type UpgradeLaneKind = LaneKind | "bbBuilder" | "bbResearch";

export interface RunningUpgrade {
  target: UpgradeTarget;
  upgrade: UpgradeState;
}

export type FinishMethod = "timePassed" | "gems" | "book" | "hammer";

export type BoostPercent = 0 | 10 | 15 | 20;

export type SlotKind = "hut" | "bob" | "goblin" | "laboratory" | "petHouse" | "builderBase" | "starLaboratory";

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
