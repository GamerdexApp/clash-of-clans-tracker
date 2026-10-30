import {
  getArmyBuildingsAtTH,
  getCraftedDefenses,
  getDefensesAtTH,
  getGuardiansAtTH,
  getHeroesAtTH,
  getResourceBuildingsAtTH,
  getTrapsAtTH,
} from "@/lib/utils/massEditHelpers";
import {
  getCraftedDefenseImageUrl,
  getTownHallImageUrl,
  getTownHallWeaponInfo,
} from "@/lib/utils/upgradeHelpers";
import type { Playthrough } from "@/types/app";
import type { AvailableCategory, UpgradeGroup } from "@/types/app/available";
import type { BuilderTarget } from "@/types/app/engine";
import type { BuildingRecordKey } from "@/types/app/game";
import type { BuilderQueueItem } from "@/types/app/queue";
import type { UpgradeStep } from "@/types/app/upgrade";

import { heroIdForName, readUpgrade } from "./upgradeEngine";
import { laneQueue, queueKey, townHallItemIds } from "./upgradeQueue";
import { upgradeSteps } from "./upgradeSteps";

const CRAFTED_AND_GUARDIAN_TOWN_HALL = 18;

const queuedKeys = (village: Playthrough): Set<string> => {
  const keys = new Set<string>();
  for (const lane of Object.keys(village.data.homeVillage.builderQueues ?? {})) {
    for (const item of laneQueue(village, "builder", Number(lane))) keys.add(queueKey(item));
  }
  return keys;
};

const keyFor = (buildingId: string, instanceIndex: number, step: UpgradeStep) =>
  `${buildingId}:${instanceIndex}:${step.level}${step.isSupercharge ? ":sc" : ""}`;

/** A running upgrade holds the next level, so the steps that can be queued start after it. */
const stepsAfterRunning = (village: Playthrough, target: BuilderTarget): UpgradeStep[] => {
  const steps = upgradeSteps(village, target);
  return readUpgrade(village, target) ? steps.slice(1) : steps;
};

interface Source {
  target: BuilderTarget;
  name: string;
  imageUrl: string;
  category: AvailableCategory;
  buildingId: string;
  instanceIndex: number;
}

const split = (village: Playthrough, source: Source, queued: Set<string>): UpgradeGroup[] => {
  const free = stepsAfterRunning(village, source.target).filter(
    (step) => !queued.has(keyFor(source.buildingId, source.instanceIndex, step)),
  );
  const normal = free.filter((step) => !step.isSupercharge);
  const supercharge = free.filter((step) => step.isSupercharge);
  const groups: UpgradeGroup[] = [];
  if (normal.length > 0) {
    groups.push({ key: `${source.buildingId}:${source.instanceIndex}`, target: source.target, name: source.name, imageUrl: source.imageUrl, category: source.category, steps: normal });
  }
  if (supercharge.length > 0) {
    groups.push({ key: `${source.buildingId}:${source.instanceIndex}:sc`, target: source.target, name: source.name, imageUrl: source.imageUrl, category: "supercharges", steps: supercharge });
  }
  return groups;
};

const buildingSources = (
  list: ReturnType<typeof getDefensesAtTH>,
  record: BuildingRecordKey,
  category: AvailableCategory,
): Source[] =>
  list.flatMap((building) =>
    Array.from({ length: building.instanceCount }, (_, instanceIndex) => ({
      target: { kind: "building", record, buildingId: building.id, instanceIndex } as BuilderTarget,
      name: building.name,
      imageUrl: building.imageUrl,
      category,
      buildingId: building.id,
      instanceIndex,
    })),
  );

/** Everything a player can add to the Builder queue, one group per building instance, hero or module. */
export const availableUpgrades = (village: Playthrough): UpgradeGroup[] => {
  const townHall = village.data.homeVillage.townHallLevel;
  const queued = queuedKeys(village);
  const sources: Source[] = [
    ...buildingSources(getDefensesAtTH(townHall), "defenses", "defenses"),
    ...buildingSources(getArmyBuildingsAtTH(townHall), "armyBuildings", "armyBuildings"),
    ...buildingSources(getResourceBuildingsAtTH(townHall), "resourceBuildings", "resourceBuildings"),
    ...buildingSources(getTrapsAtTH(townHall), "traps", "traps"),
    ...(townHall >= CRAFTED_AND_GUARDIAN_TOWN_HALL
      ? buildingSources(getGuardiansAtTH(townHall), "defenses", "guardians")
      : []),
    ...getHeroesAtTH(townHall).map((hero) => ({
      target: { kind: "hero", name: hero.name } as BuilderTarget,
      name: hero.name,
      imageUrl: hero.imageUrl,
      category: "heroes" as const,
      buildingId: hero.id,
      instanceIndex: 0,
    })),
    {
      target: { kind: "townHall" },
      name: `Town Hall ${townHall + 1}`,
      imageUrl: getTownHallImageUrl(townHall + 1),
      category: "townHall",
      buildingId: townHallItemIds.townHall,
      instanceIndex: 0,
    },
  ];

  const weapon = getTownHallWeaponInfo(townHall);
  if (weapon) {
    sources.push({
      target: { kind: "townHallWeapon" },
      name: weapon.name,
      imageUrl: weapon.imageUrl,
      category: "townHall",
      buildingId: townHallItemIds.weapon,
      instanceIndex: 0,
    });
  }
  if (townHall >= CRAFTED_AND_GUARDIAN_TOWN_HALL) {
    for (const defense of getCraftedDefenses()) {
      defense.modules.forEach((module, moduleIndex) =>
        sources.push({
          target: { kind: "crafted", defenseId: defense.id, moduleIndex },
          name: `${defense.name}, ${module.name}`,
          imageUrl: getCraftedDefenseImageUrl(defense.id),
          category: "craftedDefenses",
          buildingId: defense.id,
          instanceIndex: moduleIndex,
        }),
      );
    }
  }

  return sources.flatMap((source) => split(village, source, queued));
};

const storedCategory = (group: UpgradeGroup): BuilderQueueItem["category"] => {
  if (group.target.kind === "building") return group.target.record;
  if (group.target.kind === "hero") return "heroes";
  if (group.target.kind === "crafted") return "craftedDefenses";
  return "townHall";
};

const buildingIdOf = (group: UpgradeGroup): string => {
  const { target } = group;
  switch (target.kind) {
    case "building":
      return target.buildingId;
    case "hero":
      return heroIdForName(target.name) ?? target.name;
    case "townHall":
      return townHallItemIds.townHall;
    case "townHallWeapon":
      return townHallItemIds.weapon;
    case "crafted":
      return target.defenseId;
  }
};

const instanceIndexOf = (target: BuilderTarget): number => {
  if (target.kind === "building") return target.instanceIndex;
  if (target.kind === "crafted") return target.moduleIndex;
  return 0;
};

/** The stored queue item keeps the raw duration and cost, and is boosted when it is read. */
export const queueItemFor = (group: UpgradeGroup, step: UpgradeStep, id = crypto.randomUUID()): BuilderQueueItem => ({
  id,
  name: group.name,
  targetLevel: step.level,
  durationMs: step.durationMs,
  cost: step.cost,
  costResource: step.costResource,
  imageUrl: step.imageUrl || group.imageUrl,
  category: storedCategory(group),
  buildingId: buildingIdOf(group),
  instanceIndex: instanceIndexOf(group.target),
  ...(step.isSupercharge ? { isSupercharge: true } : {}),
});

/** "Add up to here": every missing level from the first one up to the chosen one, in order. */
export const stepsUpTo = (group: UpgradeGroup, level: number): UpgradeStep[] =>
  group.steps.filter((step) => step.level <= level);
