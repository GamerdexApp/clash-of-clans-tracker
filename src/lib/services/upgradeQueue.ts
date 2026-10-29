import { advanceToActiveWindow } from "@/lib/utils/activeHoursHelpers";
import { applyBoost } from "@/lib/utils/upgradeHelpers";
import type { Playthrough } from "@/types/app";
import type { BuilderSlotState, LaneKind, UpgradeTarget } from "@/types/app/engine";
import type {
  AnyQueueItem,
  BuilderBaseQueueItem,
  BuilderQueueItem,
  PetQueueItem,
  ResearchQueueItem,
} from "@/types/app/queue";
import type {
  ActiveBlock,
  LaneSchedule,
  QueueConflict,
  QueueSchedule,
  ScheduleOptions,
  ScheduledBlock,
} from "@/types/app/queueEngine";
import type { UpgradeStep } from "@/types/app/upgrade";

import {
  boostedStep,
  builderSlots,
  petSlots,
  readLevel,
  readUpgrade,
  requirementBlock,
  bbBuilderSlots,
  bbResearchSlots,
  researchSlots,
  startUpgrade,
} from "./upgradeEngine";
import { targetName } from "./upgradeLabels";
import { upgradeSteps } from "./upgradeSteps";

const TOWN_HALL_ID = "town-hall";
const TOWN_HALL_WEAPON_ID = "town-hall-weapon";

const isBuilderBaseItem = (item: AnyQueueItem): item is BuilderBaseQueueItem => "target" in item;
const isBuilderItem = (item: AnyQueueItem): item is BuilderQueueItem => "buildingId" in item;
const isResearchItem = (item: AnyQueueItem): item is ResearchQueueItem => "category" in item && !isBuilderItem(item);

/** Queue items keep the stored shape: heroes by id, the Town Hall and weapon by fixed ids, crafted modules by index. */
export const targetForItem = (item: AnyQueueItem): UpgradeTarget => {
  if (isBuilderBaseItem(item)) return item.target;
  if (isResearchItem(item)) return { kind: "research", record: item.category, name: item.name };
  if (!isBuilderItem(item)) return { kind: "pet", name: item.name };
  switch (item.category) {
    case "heroes":
      return { kind: "hero", name: item.name };
    case "townHall":
      return item.buildingId === TOWN_HALL_WEAPON_ID ? { kind: "townHallWeapon" } : { kind: "townHall" };
    case "craftedDefenses":
      return { kind: "crafted", defenseId: item.buildingId, moduleIndex: item.instanceIndex };
    default:
      return { kind: "building", record: item.category, buildingId: item.buildingId, instanceIndex: item.instanceIndex };
  }
};

export const stepForItem = (item: AnyQueueItem): UpgradeStep => ({
  level: item.targetLevel,
  cost: item.cost,
  costResource: item.costResource,
  durationMs: item.durationMs,
  buildTime: { days: 0, hours: 0, minutes: 0, seconds: 0 },
  imageUrl: item.imageUrl,
  ...(isBuilderItem(item) && item.isSupercharge ? { isSupercharge: true } : {}),
});

const isSuperchargeItem = (item: AnyQueueItem) => isBuilderItem(item) && item.isSupercharge === true;

/** Two items with the same key are the same level of the same thing. */
export const queueKey = (item: AnyQueueItem) => {
  if (isBuilderBaseItem(item)) return `bb:${JSON.stringify(item.target)}:${item.targetLevel}`;
  if (isBuilderItem(item)) {
    return `${item.buildingId}:${item.instanceIndex}:${item.targetLevel}${item.isSupercharge ? ":sc" : ""}`;
  }
  return `${isResearchItem(item) ? `research:${item.category}` : "pet"}:${item.name}:${item.targetLevel}`;
};

/** Items in one group are levels of the same thing, so they must run in level order. */
const levelGroupKey = (item: AnyQueueItem) => {
  if (isBuilderBaseItem(item)) return `bb:${JSON.stringify(item.target)}`;
  if (isBuilderItem(item)) return `${item.buildingId}:${item.instanceIndex}:${item.isSupercharge ? "sc" : "n"}`;
  return `${isResearchItem(item) ? `research:${item.category}` : "pet"}:${item.name}`;
};

export const townHallItemIds = { townHall: TOWN_HALL_ID, weapon: TOWN_HALL_WEAPON_ID };

const PET_LANE_KEY = "1";

/** The pet queue is stored as one list. It reads as a single lane so every queue works the same way. */
const queuesOf = (village: Playthrough, lane: LaneKind): Record<string, AnyQueueItem[]> => {
  const hv = village.data.homeVillage;
  if (lane === "bbBuilder") return village.bbQueue?.builder ?? {};
  if (lane === "bbResearch") return village.bbQueue?.research ?? {};
  if (lane === "builder") return hv.builderQueues ?? {};
  if (lane === "research") return hv.researchQueue ?? {};
  return { [PET_LANE_KEY]: hv.petQueue ?? [] };
};

const withQueues = (village: Playthrough, lane: LaneKind, queues: Record<string, AnyQueueItem[]>): Playthrough => {
  const hv = village.data.homeVillage;
  if (lane === "bbBuilder" || lane === "bbResearch") {
    const bbQueues = queues as Record<string, BuilderBaseQueueItem[]>;
    return { ...village, bbQueue: { ...village.bbQueue, [lane === "bbBuilder" ? "builder" : "research"]: bbQueues } };
  }
  const written = {
    builder: { builderQueues: queues as Record<string, BuilderQueueItem[]> },
    research: { researchQueue: queues as Record<string, ResearchQueueItem[]> },
    pet: { petQueue: (queues[PET_LANE_KEY] ?? []) as PetQueueItem[] },
  }[lane];
  return { ...village, data: { ...village.data, homeVillage: { ...hv, ...written } } };
};

export const laneQueue = (village: Playthrough, lane: LaneKind, laneId: number): AnyQueueItem[] =>
  queuesOf(village, lane)[String(laneId)] ?? [];

export const addToQueue = (village: Playthrough, lane: LaneKind, laneId: number, item: AnyQueueItem): Playthrough => {
  const queues = queuesOf(village, lane);
  if (Object.values(queues).flat().some((queued) => queueKey(queued) === queueKey(item))) return village;
  return withQueues(village, lane, { ...queues, [String(laneId)]: [...laneQueue(village, lane, laneId), item] });
};

export const removeFromQueue = (village: Playthrough, lane: LaneKind, itemId: string): Playthrough => {
  const queues = queuesOf(village, lane);
  const next = Object.fromEntries(
    Object.entries(queues).map(([key, items]) => [key, items.filter((item) => item.id !== itemId)]),
  );
  return withQueues(village, lane, next);
};

/** Moves an item to a lane and position. The same call reorders inside a lane and moves between lanes. */
export const moveQueueItem = (
  village: Playthrough,
  lane: LaneKind,
  itemId: string,
  toLaneId: number,
  toIndex: number,
): Playthrough => {
  const queues = queuesOf(village, lane);
  const moving = Object.values(queues).flat().find((item) => item.id === itemId);
  if (!moving) return village;

  const without = Object.fromEntries(
    Object.entries(queues).map(([lane, items]) => [lane, items.filter((item) => item.id !== itemId)]),
  );
  const target = [...(without[String(toLaneId)] ?? [])];
  target.splice(Math.max(0, Math.min(toIndex, target.length)), 0, moving);
  return withQueues(village, lane, { ...without, [String(toLaneId)]: target });
};

const levelAfterRunning = (village: Playthrough, target: UpgradeTarget) =>
  readLevel(village, target) + (readUpgrade(village, target) ? 1 : 0);

const requiredBuildingNames = { laboratory: "Laboratory", "pet-house": "Pet House", "star-laboratory": "Star Laboratory" };

const requirementText = (village: Playthrough, target: UpgradeTarget, item: AnyQueueItem): string | null => {
  if (target.kind !== "research" && target.kind !== "pet" && target.kind !== "bbTroop") return null;
  const step = upgradeSteps(village, target).find((candidate) => candidate.level === item.targetLevel);
  const missing = step ? requirementBlock(village, step) : null;
  if (!missing) return null;
  if (missing.building === "pet-house" && missing.builtLevel === 0) return "Build a Pet House first";
  return `Requires ${requiredBuildingNames[missing.building]} ${missing.level}`;
};

/** Why a queued item cannot start yet, or null. The earlier level must be finished first. */
export const queueStartBlocker = (village: Playthrough, item: AnyQueueItem): string | null => {
  const target = targetForItem(item);
  if (readUpgrade(village, target)) return `${targetName(target)} is already upgrading`;
  const level = readLevel(village, target);
  if (!isSuperchargeItem(item)) {
    if (level < item.targetLevel - 1) return `Level ${level + 1} must finish first`;
    if (level >= item.targetLevel) return `Already at level ${level}`;
  }
  return requirementText(village, target, item);
};

/** Takes the item off its lane and starts it on that lane. */
export const startFromQueue = (
  village: Playthrough,
  lane: LaneKind,
  laneId: number,
  itemId: string,
  options: { boostPercent: 0 | 10 | 15 | 20; now: Date },
): Playthrough => {
  const item = laneQueue(village, lane, laneId).find((queued) => queued.id === itemId);
  if (!item) return village;
  return startUpgrade(removeFromQueue(village, lane, itemId), targetForItem(item), stepForItem(item), laneId, options);
};

const advance = (date: Date, activeHours: ScheduleOptions["activeHours"]) =>
  activeHours ? advanceToActiveWindow(date, activeHours) : date;

const activeBlockFor = (village: Playthrough, slot: BuilderSlotState): ActiveBlock | null => {
  const running = slot.running;
  if (!running) return null;
  const level = readLevel(village, running.target);
  return {
    label: `${targetName(running.target)} ${level}→${level + 1}`,
    target: running.target,
    startsAt: new Date(running.upgrade.upgradeStartedAt),
    endsAt: new Date(running.upgrade.finishesAt),
  };
};

const scheduleLane = (
  village: Playthrough,
  lane: LaneKind,
  slot: BuilderSlotState,
  options: ScheduleOptions,
): LaneSchedule => {
  const active = activeBlockFor(village, slot);
  let cursor = advance(active ? active.endsAt : options.now, options.activeHours);
  const blocks: ScheduledBlock[] = [];

  for (const item of laneQueue(village, lane, slot.id)) {
    const boostedMs = applyBoost(item.durationMs, options.boostPercent);
    const startsAt = new Date(cursor);
    const endsAt = new Date(startsAt.getTime() + boostedMs);
    blocks.push({ item, startsAt, endsAt, boostedMs });
    cursor = advance(endsAt, options.activeHours);
  }

  const last = blocks.at(-1)?.endsAt ?? active?.endsAt ?? null;
  return { slot, active, blocks, doneAt: last };
};

const findConflicts = (village: Playthrough, lanes: LaneSchedule[]): QueueConflict[] => {
  const conflicts: QueueConflict[] = [];
  const blocks = lanes.flatMap((lane) => lane.blocks.map((block) => ({ block, builderId: lane.slot.id })));

  for (const { block, builderId } of blocks) {
    const target = targetForItem(block.item);
    if (!isSuperchargeItem(block.item) && block.item.targetLevel <= levelAfterRunning(village, target)) {
      conflicts.push({
        itemId: block.item.id,
        builderId,
        message: `${targetName(target)} is already at level ${levelAfterRunning(village, target)}, so level ${block.item.targetLevel} is done.`,
        fix: "Remove it from the queue.",
      });
    }
  }

  const groups = new Map<string, typeof blocks>();
  for (const entry of blocks) {
    const key = levelGroupKey(entry.block.item);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  for (const group of groups.values()) {
    const byLevel = [...group].sort((a, b) => a.block.item.targetLevel - b.block.item.targetLevel);
    for (let index = 1; index < byLevel.length; index += 1) {
      const earlier = byLevel[index - 1];
      const later = byLevel[index];
      if (earlier.block.endsAt > later.block.startsAt) {
        const name = targetName(targetForItem(later.block.item));
        conflicts.push({
          itemId: later.block.item.id,
          builderId: later.builderId,
          message: `${name} level ${later.block.item.targetLevel} is scheduled before level ${earlier.block.item.targetLevel} is done.`,
          fix: `Move level ${later.block.item.targetLevel} after level ${earlier.block.item.targetLevel}.`,
        });
      }
    }
  }
  return conflicts;
};

/** The lanes of a queue. The goblin flag is the Goblin Builder for builders and the Goblin Researcher for research. */
export const laneSlots = (village: Playthrough, lane: LaneKind, goblinEnabled: boolean) => {
  if (lane === "builder") return builderSlots(village, goblinEnabled);
  if (lane === "research") return researchSlots(village, goblinEnabled);
  if (lane === "bbBuilder") return bbBuilderSlots(village);
  if (lane === "bbResearch") return bbResearchSlots(village);
  return petSlots(village);
};

export const scheduleQueue = (
  village: Playthrough,
  lane: LaneKind,
  goblinEnabled: boolean,
  options: ScheduleOptions,
): QueueSchedule => {
  const { slots } = laneSlots(village, lane, goblinEnabled);
  const lanes = slots.map((slot) => scheduleLane(village, lane, slot, options));
  const queued = lanes.flatMap((lane) => lane.blocks);

  const costByResource: Record<string, number> = {};
  for (const { item } of queued) {
    const { cost } = boostedStep(stepForItem(item), options.boostPercent, lane);
    costByResource[item.costResource] = (costByResource[item.costResource] ?? 0) + cost;
  }
  const ends = lanes.map((lane) => lane.doneAt).filter((date): date is Date => date !== null);

  return {
    lanes,
    conflicts: findConflicts(village, lanes),
    totals: {
      freeBuilders: slots.filter((slot) => slot.running === null).length,
      totalBuilders: slots.length,
      queuedCount: queued.length,
      queuedMs: queued.reduce((sum, block) => sum + block.boostedMs, 0),
      allDoneAt: ends.length === 0 ? null : new Date(Math.max(...ends.map((date) => date.getTime()))),
      costByResource,
    },
  };
};
