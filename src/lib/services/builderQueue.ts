import { advanceToActiveWindow } from "@/lib/utils/activeHoursHelpers";
import { applyBoost } from "@/lib/utils/upgradeHelpers";
import type { Playthrough } from "@/types/app";
import type { BuilderSlotState, UpgradeTarget } from "@/types/app/engine";
import type { BuilderQueueItem } from "@/types/app/queue";
import type {
  ActiveBlock,
  LaneSchedule,
  QueueConflict,
  QueueSchedule,
  ScheduleOptions,
  ScheduledBlock,
} from "@/types/app/queueEngine";
import type { UpgradeStep } from "@/types/app/upgrade";

import { boostedStep, builderSlots, readLevel, readUpgrade, startUpgrade } from "./upgradeEngine";
import { targetName } from "./upgradeLabels";

const TOWN_HALL_ID = "town-hall";
const TOWN_HALL_WEAPON_ID = "town-hall-weapon";

/** Queue items keep the stored shape: heroes by id, the Town Hall and weapon by fixed ids, crafted modules by index. */
export const targetForItem = (item: BuilderQueueItem): UpgradeTarget => {
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

export const stepForItem = (item: BuilderQueueItem): UpgradeStep => ({
  level: item.targetLevel,
  cost: item.cost,
  costResource: item.costResource,
  durationMs: item.durationMs,
  buildTime: { days: 0, hours: 0, minutes: 0, seconds: 0 },
  imageUrl: item.imageUrl,
  isSupercharge: item.isSupercharge,
});

export const queueKey = (item: BuilderQueueItem) =>
  `${item.buildingId}:${item.instanceIndex}:${item.targetLevel}${item.isSupercharge ? ":sc" : ""}`;

export const townHallItemIds = { townHall: TOWN_HALL_ID, weapon: TOWN_HALL_WEAPON_ID };

const queuesOf = (village: Playthrough) => village.data.homeVillage.builderQueues ?? {};

export const laneQueue = (village: Playthrough, builderId: number): BuilderQueueItem[] =>
  queuesOf(village)[String(builderId)] ?? [];

const withQueues = (village: Playthrough, queues: Record<string, BuilderQueueItem[]>): Playthrough => ({
  ...village,
  data: { ...village.data, homeVillage: { ...village.data.homeVillage, builderQueues: queues } },
});

export const addToQueue = (village: Playthrough, builderId: number, item: BuilderQueueItem): Playthrough => {
  const queues = queuesOf(village);
  const all = Object.values(queues).flat();
  if (all.some((queued) => queueKey(queued) === queueKey(item))) return village;
  return withQueues(village, { ...queues, [String(builderId)]: [...laneQueue(village, builderId), item] });
};

export const removeFromQueue = (village: Playthrough, itemId: string): Playthrough => {
  const queues = queuesOf(village);
  const next = Object.fromEntries(
    Object.entries(queues).map(([lane, items]) => [lane, items.filter((item) => item.id !== itemId)]),
  );
  return withQueues(village, next);
};

/** Moves an item to a lane and position. The same call reorders inside a lane and moves between lanes. */
export const moveQueueItem = (
  village: Playthrough,
  itemId: string,
  toBuilderId: number,
  toIndex: number,
): Playthrough => {
  const queues = queuesOf(village);
  const moving = Object.values(queues).flat().find((item) => item.id === itemId);
  if (!moving) return village;

  const without = Object.fromEntries(
    Object.entries(queues).map(([lane, items]) => [lane, items.filter((item) => item.id !== itemId)]),
  );
  const target = [...(without[String(toBuilderId)] ?? [])];
  target.splice(Math.max(0, Math.min(toIndex, target.length)), 0, moving);
  return withQueues(village, { ...without, [String(toBuilderId)]: target });
};

const levelAfterRunning = (village: Playthrough, target: UpgradeTarget) =>
  readLevel(village, target) + (readUpgrade(village, target) ? 1 : 0);

/** Why a queued item cannot start yet, or null. The earlier level must be finished first. */
export const queueStartBlocker = (village: Playthrough, item: BuilderQueueItem): string | null => {
  const target = targetForItem(item);
  if (readUpgrade(village, target)) return `${targetName(target)} is already upgrading`;
  const level = readLevel(village, target);
  if (item.isSupercharge) return null;
  if (level < item.targetLevel - 1) return `Level ${level + 1} must finish first`;
  if (level >= item.targetLevel) return `Already at level ${level}`;
  return null;
};

/** Takes the item off its lane and starts it on that lane's builder. */
export const startFromQueue = (
  village: Playthrough,
  builderId: number,
  itemId: string,
  options: { boostPercent: 0 | 10 | 15 | 20; now: Date },
): Playthrough => {
  const item = laneQueue(village, builderId).find((queued) => queued.id === itemId);
  if (!item) return village;
  return startUpgrade(removeFromQueue(village, itemId), targetForItem(item), stepForItem(item), builderId, options);
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

const scheduleLane = (village: Playthrough, slot: BuilderSlotState, options: ScheduleOptions): LaneSchedule => {
  const active = activeBlockFor(village, slot);
  let cursor = advance(active ? active.endsAt : options.now, options.activeHours);
  const blocks: ScheduledBlock[] = [];

  for (const item of laneQueue(village, slot.id)) {
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
    if (!block.item.isSupercharge && block.item.targetLevel <= levelAfterRunning(village, target)) {
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
    const key = `${entry.block.item.buildingId}:${entry.block.item.instanceIndex}:${entry.block.item.isSupercharge ? "sc" : "n"}`;
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

export const scheduleQueue = (
  village: Playthrough,
  goblinBuilderEnabled: boolean,
  options: ScheduleOptions,
): QueueSchedule => {
  const { slots } = builderSlots(village, goblinBuilderEnabled);
  const lanes = slots.map((slot) => scheduleLane(village, slot, options));
  const queued = lanes.flatMap((lane) => lane.blocks);

  const costByResource: Record<string, number> = {};
  for (const { item } of queued) {
    const { cost } = boostedStep(stepForItem(item), options.boostPercent);
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
