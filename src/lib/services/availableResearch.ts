import { getPetsAtTH, getSiegeMachinesAtTH, getSpellsAtTH, getTroopsAtTH } from "@/lib/utils/massEditHelpers";
import type { Playthrough } from "@/types/app";
import type { AvailableGroup, ResearchAvailability, ResearchCategory } from "@/types/app/available";
import type { UpgradeTarget } from "@/types/app/engine";
import type { ResearchKey } from "@/types/app/game";
import type { PetQueueItem, ResearchQueueItem } from "@/types/app/queue";
import type { UpgradeStep } from "@/types/app/upgrade";

import { readLevel, readUpgrade } from "./upgradeEngine";
import { laneQueue, queueKey } from "./upgradeQueue";
import { upgradeSteps } from "./upgradeSteps";

const PETS_TOWN_HALL = 14;

interface Source {
  target: UpgradeTarget;
  name: string;
  imageUrl: string;
  category: ResearchCategory;
}

const keyFor = (source: Source, step: UpgradeStep) =>
  source.target.kind === "research"
    ? `research:${source.target.record}:${source.name}:${step.level}`
    : `pet:${source.name}:${step.level}`;

const queuedKeys = (village: Playthrough): Set<string> => {
  const keys = new Set<string>();
  for (const lane of [1, 7]) for (const item of laneQueue(village, "research", lane)) keys.add(queueKey(item));
  for (const item of laneQueue(village, "pet", 1)) keys.add(queueKey(item));
  return keys;
};

const researchSources = (townHall: number): Source[] => {
  const lists: Array<[ResearchKey, ReturnType<typeof getTroopsAtTH>]> = [
    ["troops", getTroopsAtTH(townHall)],
    ["spells", getSpellsAtTH(townHall)],
    ["siegeMachines", getSiegeMachinesAtTH(townHall)],
  ];
  const research = lists.flatMap(([record, items]) =>
    items.map((item) => ({
      target: { kind: "research", record, name: item.name } as UpgradeTarget,
      name: item.name,
      imageUrl: item.imageUrl,
      category: record,
    })),
  );
  const pets =
    townHall >= PETS_TOWN_HALL
      ? getPetsAtTH(townHall).map((pet) => ({
          target: { kind: "pet", name: pet.name } as UpgradeTarget,
          name: pet.name,
          imageUrl: pet.imageUrl,
          category: "pets" as const,
        }))
      : [];
  return [...research, ...pets];
};

/** A running upgrade holds the next level, so the steps that can be queued start after it. */
const stepsAfterRunning = (village: Playthrough, target: UpgradeTarget): UpgradeStep[] => {
  const steps = upgradeSteps(village, target);
  return readUpgrade(village, target) ? steps.slice(1) : steps;
};

/** Everything a player can add to a research or pet queue. Level 0 items are listed to unlock first. */
export const availableResearch = (village: Playthrough, pets: boolean): ResearchAvailability => {
  const queued = queuedKeys(village);
  const groups: AvailableGroup[] = [];
  const locked: AvailableGroup[] = [];

  for (const source of researchSources(village.data.homeVillage.townHallLevel)) {
    if ((source.category === "pets") !== pets) continue;
    const base = { key: `${source.category}:${source.name}`, target: source.target, name: source.name, imageUrl: source.imageUrl, category: source.category };
    if (readLevel(village, source.target) === 0 && !readUpgrade(village, source.target)) {
      locked.push({ ...base, steps: [] });
      continue;
    }
    const steps = stepsAfterRunning(village, source.target).filter((step) => !queued.has(keyFor(source, step)));
    if (steps.length > 0) groups.push({ ...base, steps });
  }
  return { groups, locked };
};

export const researchQueueItemFor = (
  group: AvailableGroup,
  step: UpgradeStep,
  id = crypto.randomUUID(),
): ResearchQueueItem | PetQueueItem => {
  const base = {
    id,
    name: group.name,
    targetLevel: step.level,
    durationMs: step.durationMs,
    cost: step.cost,
    costResource: step.costResource,
    imageUrl: step.imageUrl || group.imageUrl,
  };
  return group.target.kind === "research" ? { ...base, category: group.target.record } : base;
};
