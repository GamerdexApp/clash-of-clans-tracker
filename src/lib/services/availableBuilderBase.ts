import {
  getBuilderArmyBuildingsAtBH,
  getBuilderDefensesAtBH,
  getBuilderHeroesAtBH,
  getBuilderResourceBuildingsAtBH,
  getBuilderTrapsAtBH,
} from "@/lib/utils/massEditBuilderHelpers";
import type { Playthrough } from "@/types/app";
import type { AvailableGroup, ResearchAvailability } from "@/types/app/available";
import type { UpgradeTarget } from "@/types/app/engine";
import type { BuildingRecordKey } from "@/types/app/game";
import type { BuilderBaseQueueItem } from "@/types/app/queue";
import type { UpgradeStep } from "@/types/app/upgrade";

import { bbTroopCatalog, builderHallImageUrl, clockTowerImageUrl } from "./builderBaseSteps";
import { readLevel, readUpgrade } from "./upgradeEngine";
import { laneQueue, queueKey } from "./upgradeQueue";
import { upgradeSteps } from "./upgradeSteps";

const BUILDER_LANE_IDS = [1, 2];
const STAR_LABORATORY_LANE_ID = 1;

interface Source {
  target: UpgradeTarget;
  name: string;
  imageUrl: string;
  category: string;
  unlockLevel?: number;
}

const queuedKeys = (village: Playthrough): Set<string> => {
  const keys = new Set<string>();
  for (const laneId of BUILDER_LANE_IDS) for (const item of laneQueue(village, "bbBuilder", laneId)) keys.add(queueKey(item));
  for (const item of laneQueue(village, "bbResearch", STAR_LABORATORY_LANE_ID)) keys.add(queueKey(item));
  return keys;
};

const keyFor = (target: UpgradeTarget, step: UpgradeStep) => `bb:${JSON.stringify(target)}:${step.level}`;

/** A running upgrade holds the next level, so the steps that can be queued start after it. */
const stepsAfterRunning = (village: Playthrough, target: UpgradeTarget): UpgradeStep[] => {
  const steps = upgradeSteps(village, target);
  return readUpgrade(village, target) ? steps.slice(1) : steps;
};

const groupsFor = (village: Playthrough, sources: Source[]): AvailableGroup[] => {
  const queued = queuedKeys(village);
  return sources.flatMap((source) => {
    const steps = stepsAfterRunning(village, source.target).filter((step) => !queued.has(keyFor(source.target, step)));
    if (steps.length === 0) return [];
    return [{ key: JSON.stringify(source.target), ...source, steps }];
  });
};

const buildingSources = (
  list: ReturnType<typeof getBuilderDefensesAtBH>,
  record: BuildingRecordKey,
  category: string,
): Source[] =>
  list.flatMap((building) =>
    Array.from({ length: building.instanceCount }, (_, instanceIndex) => ({
      target: { kind: "bbBuilding", record, buildingId: building.id, instanceIndex } as UpgradeTarget,
      name: building.name,
      imageUrl: building.imageUrl,
      category,
    })),
  );

/** Everything a player can add to the Builder Base queue, one group per building, hero, Clock Tower or Builder Hall. */
export const availableBBUpgrades = (village: Playthrough): AvailableGroup[] => {
  const hall = village.data.builderBase.builderHallLevel;
  const hallLevel = readLevel(village, { kind: "builderHall" });
  const sources: Source[] = [
    ...buildingSources(getBuilderDefensesAtBH(hall), "defenses", "defenses"),
    ...buildingSources(getBuilderArmyBuildingsAtBH(hall), "armyBuildings", "armyBuildings"),
    ...buildingSources(getBuilderResourceBuildingsAtBH(hall), "resourceBuildings", "resourceBuildings"),
    ...buildingSources(getBuilderTrapsAtBH(hall), "traps", "traps"),
    ...getBuilderHeroesAtBH(hall).map((hero) => ({
      target: { kind: "bbHero", name: hero.name } as UpgradeTarget,
      name: hero.name,
      imageUrl: hero.imageUrl,
      category: "heroes",
    })),
    {
      target: { kind: "clockTower" },
      name: "Clock Tower",
      imageUrl: clockTowerImageUrl(readLevel(village, { kind: "clockTower" })),
      category: "other",
    },
    {
      target: { kind: "builderHall" },
      name: `Builder Hall ${hallLevel + 1}`,
      imageUrl: builderHallImageUrl(hallLevel + 1),
      category: "other",
    },
  ];
  return groupsFor(village, sources);
};

/** Troops at level 0 are listed to unlock first, the way research is. */
export const availableBBResearch = (village: Playthrough): ResearchAvailability => {
  const sources: Source[] = bbTroopCatalog(village.data.builderBase.builderHallLevel)
    .filter((troop) => troop.maxLevel > 0)
    .map((troop) => ({
      target: { kind: "bbTroop", name: troop.name },
      name: troop.name,
      imageUrl: troop.imageUrl,
      category: "troops",
      unlockLevel: troop.firstLevel,
    }));

  const unlocked = (source: Source) => readLevel(village, source.target) > 0 || readUpgrade(village, source.target);
  const locked = sources.filter((source) => !unlocked(source)).map((source) => ({ key: JSON.stringify(source.target), ...source, steps: [] }));
  return { groups: groupsFor(village, sources.filter(unlocked)), locked };
};

/** The stored queue item keeps the raw duration and cost, and is boosted when it is read. */
export const bbQueueItemFor = (group: AvailableGroup, step: UpgradeStep, id = crypto.randomUUID()): BuilderBaseQueueItem => ({
  id,
  name: group.name,
  targetLevel: step.level,
  durationMs: step.durationMs,
  cost: step.cost,
  costResource: step.costResource,
  imageUrl: step.imageUrl || group.imageUrl,
  target: group.target,
});
