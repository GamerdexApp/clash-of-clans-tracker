import type { UpgradeTarget } from "./engine";

interface BaseQueueItem {
  id: string;
  name: string;
  targetLevel: number;
  durationMs: number;
  cost: number;
  costResource: string;
  imageUrl: string;
}

export interface BuilderQueueItem extends BaseQueueItem {
  category: "defenses" | "armyBuildings" | "resourceBuildings" | "traps" | "heroes" | "townHall" | "craftedDefenses";
  buildingId: string;
  instanceIndex: number;
  isSupercharge?: boolean;
}

export interface ResearchQueueItem extends BaseQueueItem {
  category: "troops" | "spells" | "siegeMachines";
}

export interface PetQueueItem extends BaseQueueItem {}

export interface QueueConflict {
  queueItemId: string;
  message: string;
}

export interface ResourceEvent {
  builderLabel: string;
  completingItem: string;
  completesAt: Date;
  nextItem: string;
  cost: number;
  costResource: string;
}

export interface ResourceGroup {
  dayOffset: number;
  date: Date;
  events: ResourceEvent[];
}

/** A Builder Base item keeps the whole target, since every Builder Base upgrade is found by its target. */
export interface BuilderBaseQueueItem extends BaseQueueItem {
  target: UpgradeTarget;
}

export type AnyQueueItem = BuilderQueueItem | ResearchQueueItem | PetQueueItem | BuilderBaseQueueItem;

export interface TimelineBlock {
  label: string;
  imageUrl: string;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  isIdle: boolean;
}
