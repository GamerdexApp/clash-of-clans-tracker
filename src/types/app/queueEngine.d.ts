import type { BuilderSlotState, BoostPercent, UpgradeTarget } from "./engine";
import type { AnyQueueItem } from "./queue";

export interface ScheduledBlock {
  item: AnyQueueItem;
  startsAt: Date;
  endsAt: Date;
  boostedMs: number;
}

export interface ActiveBlock {
  label: string;
  target: UpgradeTarget;
  startsAt: Date;
  endsAt: Date;
}

export interface LaneSchedule {
  slot: BuilderSlotState;
  active: ActiveBlock | null;
  blocks: ScheduledBlock[];
  doneAt: Date | null;
}

export interface QueueConflict {
  itemId: string;
  builderId: number;
  message: string;
  fix: string;
}

export interface QueueTotals {
  freeBuilders: number;
  totalBuilders: number;
  queuedCount: number;
  queuedMs: number;
  allDoneAt: Date | null;
  costByResource: Record<string, number>;
}

export interface QueueSchedule {
  lanes: LaneSchedule[];
  conflicts: QueueConflict[];
  totals: QueueTotals;
}

export interface ScheduleOptions {
  now: Date;
  boostPercent: BoostPercent;
  activeHours?: { startUtcMinutes: number; endUtcMinutes: number };
}
