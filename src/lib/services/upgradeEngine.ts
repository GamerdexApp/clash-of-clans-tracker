import { home } from "clash-of-clans-data";

import { applyBoost, applyBuilderBoostCost, getBuildingUpgradeSteps } from "@/lib/utils/upgradeHelpers";
import type { Playthrough } from "@/types/app";
import type {
  BoostPercent,
  BuilderSlotState,
  BuilderSlots,
  CompletedUpgrade,
  FinishMethod,
  FinishResult,
  RunningUpgrade,
  StartBlocker,
  UpgradeTarget,
} from "@/types/app/engine";
import type {
  BuildingInstance,
  BuildingRecord,
  BuildingRecordKey,
  CraftedDefenseData,
  HomeVillageData,
  TrackedHero,
  UpgradeState,
} from "@/types/app/game";
import type { UpgradeStep } from "@/types/app/upgrade";

const BUILDING_RECORDS: BuildingRecordKey[] = ["defenses", "armyBuildings", "resourceBuildings", "traps"];
const BUILDER_HUT = "builders-hut";
const BOB_HUT = "bobs-hut";
export const BOB_SLOT_ID = 6;
export const GOBLIN_SLOT_ID = 7;
const HUT_SLOT_COUNT = 5;
const WEAPON_TOWN_HALL = 17;
const MODULES_PER_CRAFTED_DEFENSE = 3;

const rawHeroes = home().heroes().get() as unknown as Array<{ id: string; name: string }>;

export const heroIdForName = (name: string): string | undefined =>
  rawHeroes.find((hero) => hero.name === name)?.id;

const homeOf = (village: Playthrough) => village.data.homeVillage;

const withHome = (village: Playthrough, change: (home: HomeVillageData) => HomeVillageData): Playthrough => ({
  ...village,
  data: { ...village.data, homeVillage: change(homeOf(village)) },
});

const instanceAt = (record: BuildingRecord, buildingId: string, index: number): BuildingInstance | undefined =>
  record[buildingId]?.[index];

/** A JSON round trip turns an empty module slot into null, so both read as no upgrade. */
const craftedUpgrade = (data: CraftedDefenseData | undefined, moduleIndex: number): UpgradeState | undefined =>
  data?.moduleUpgrades?.[moduleIndex] ?? undefined;

export const readUpgrade = (village: Playthrough, target: UpgradeTarget): UpgradeState | undefined => {
  const hv = homeOf(village);
  switch (target.kind) {
    case "building":
      return instanceAt(hv[target.record], target.buildingId, target.instanceIndex)?.upgrade;
    case "hero":
      return hv.heroes.find((hero) => hero.name === target.name)?.upgrade;
    case "townHall":
      return hv.townHallUpgrade;
    case "townHallWeapon":
      return hv.townHallWeaponUpgrade;
    case "crafted":
      return craftedUpgrade(hv.craftedDefenses[target.defenseId], target.moduleIndex);
  }
};

export const readLevel = (village: Playthrough, target: UpgradeTarget): number => {
  const hv = homeOf(village);
  switch (target.kind) {
    case "building":
      return instanceAt(hv[target.record], target.buildingId, target.instanceIndex)?.level ?? 0;
    case "hero":
      return hv.heroes.find((hero) => hero.name === target.name)?.level ?? 0;
    case "townHall":
      return hv.townHallLevel;
    case "townHallWeapon":
      return hv.townHallWeaponLevel ?? 0;
    case "crafted":
      return hv.craftedDefenses[target.defenseId]?.modules[target.moduleIndex] ?? 0;
  }
};

const writeBuildingInstance = (
  hv: HomeVillageData,
  target: Extract<UpgradeTarget, { kind: "building" }>,
  change: (instance: BuildingInstance) => BuildingInstance,
): HomeVillageData => {
  const record = hv[target.record];
  const instances = [...(record[target.buildingId] ?? [])];
  while (instances.length <= target.instanceIndex) instances.push({ level: 0 });
  instances[target.instanceIndex] = change(instances[target.instanceIndex]);
  return { ...hv, [target.record]: { ...record, [target.buildingId]: instances } };
};

const writeCraftedModule = (
  hv: HomeVillageData,
  target: Extract<UpgradeTarget, { kind: "crafted" }>,
  change: (level: number, upgrade: UpgradeState | undefined) => { level: number; upgrade: UpgradeState | undefined },
): HomeVillageData => {
  const existing = hv.craftedDefenses[target.defenseId] ?? {
    modules: Array(MODULES_PER_CRAFTED_DEFENSE).fill(0) as [number, number, number],
  };
  const modules = [...existing.modules] as [number, number, number];
  const upgrades = Array.from({ length: MODULES_PER_CRAFTED_DEFENSE }, (_, index) => craftedUpgrade(existing, index));
  const next = change(modules[target.moduleIndex] ?? 0, upgrades[target.moduleIndex]);
  modules[target.moduleIndex] = next.level;
  upgrades[target.moduleIndex] = next.upgrade;
  return {
    ...hv,
    craftedDefenses: { ...hv.craftedDefenses, [target.defenseId]: { ...existing, modules, moduleUpgrades: upgrades } },
  };
};

/** A hero the player has not started tracking is added at level 0 when it first changes. */
const mapHero = (hv: HomeVillageData, name: string, change: (hero: TrackedHero) => TrackedHero): HomeVillageData => {
  const heroes = hv.heroes.some((hero) => hero.name === name)
    ? hv.heroes
    : [...hv.heroes, { name, level: 0, equipment: [] }];
  return { ...hv, heroes: heroes.map((hero) => (hero.name === name ? change(hero) : hero)) };
};

const writeUpgrade = (village: Playthrough, target: UpgradeTarget, upgrade: UpgradeState | undefined): Playthrough =>
  withHome(village, (hv) => {
    switch (target.kind) {
      case "building":
        return writeBuildingInstance(hv, target, (instance) => ({ ...instance, upgrade }));
      case "hero":
        return mapHero(hv, target.name, (hero) => ({ ...hero, upgrade }));
      case "townHall":
        return { ...hv, townHallUpgrade: upgrade };
      case "townHallWeapon":
        return { ...hv, townHallWeaponUpgrade: upgrade };
      case "crafted":
        return writeCraftedModule(hv, target, (level) => ({ level, upgrade }));
    }
  });

/** Every upgrade that holds a builder: buildings, heroes, the Town Hall, its weapon and crafted modules. */
export const runningUpgrades = (village: Playthrough): RunningUpgrade[] => {
  const hv = homeOf(village);
  const found: RunningUpgrade[] = [];
  const add = (target: UpgradeTarget, upgrade: UpgradeState | undefined) => {
    if (upgrade) found.push({ target, upgrade });
  };

  for (const record of BUILDING_RECORDS) {
    for (const [buildingId, instances] of Object.entries(hv[record])) {
      instances.forEach((instance, instanceIndex) =>
        add({ kind: "building", record, buildingId, instanceIndex }, instance.upgrade),
      );
    }
  }
  hv.heroes.forEach((hero) => add({ kind: "hero", name: hero.name }, hero.upgrade));
  add({ kind: "townHall" }, hv.townHallUpgrade);
  add({ kind: "townHallWeapon" }, hv.townHallWeaponUpgrade);
  for (const [defenseId, data] of Object.entries(hv.craftedDefenses)) {
    for (let moduleIndex = 0; moduleIndex < MODULES_PER_CRAFTED_DEFENSE; moduleIndex += 1) {
      add({ kind: "crafted", defenseId, moduleIndex }, craftedUpgrade(data, moduleIndex));
    }
  }
  return found;
};

export const builderLabelFor = (id: number): string => {
  if (id === BOB_SLOT_ID) return "B.O.B";
  if (id === GOBLIN_SLOT_ID) return "Goblin Builder";
  return `Builder ${id}`;
};

/**
 * Builders 1 to 5 are the Builder's Huts, 6 is B.O.B and 7 is the Goblin Builder. A slot exists
 * when its hut is built, so a number never moves when another hut is added or removed.
 */
export const builderSlots = (village: Playthrough, goblinBuilderEnabled: boolean): BuilderSlots => {
  const hv = homeOf(village);
  const running = runningUpgrades(village);
  const huts = hv.defenses[BUILDER_HUT] ?? [];
  const bobBuilt = (hv.armyBuildings[BOB_HUT]?.[0]?.level ?? 0) > 0;

  const slotIds: number[] = [];
  for (let id = 1; id <= HUT_SLOT_COUNT; id += 1) if ((huts[id - 1]?.level ?? 0) > 0) slotIds.push(id);
  if (bobBuilt) slotIds.push(BOB_SLOT_ID);
  if (goblinBuilderEnabled) slotIds.push(GOBLIN_SLOT_ID);

  const slots: BuilderSlotState[] = slotIds.map((id) => ({
    id,
    label: builderLabelFor(id),
    kind: id === BOB_SLOT_ID ? "bob" : id === GOBLIN_SLOT_ID ? "goblin" : "hut",
    running: running.find((entry) => entry.upgrade.builderId === id) ?? null,
  }));
  const known = new Set(slotIds);
  return { slots, unassigned: running.filter((entry) => !known.has(entry.upgrade.builderId)) };
};

export const freeBuilderCount = ({ slots }: BuilderSlots) => slots.filter((slot) => slot.running === null).length;

/** The time and cost a player pays with the boost on. Gem costs are never discounted. */
export const boostedStep = (step: UpgradeStep, boostPercent: BoostPercent): { durationMs: number; cost: number } => ({
  durationMs: applyBoost(step.durationMs, boostPercent),
  cost: step.costResource === "Gems" ? step.cost : applyBuilderBoostCost(step.cost, boostPercent),
});

/** A build with no build time finishes the moment it starts and never holds a builder. */
export const isInstantStep = (step: UpgradeStep) => step.durationMs === 0;

export const startBlocker = (
  village: Playthrough,
  target: UpgradeTarget,
  step: UpgradeStep,
  builderId: number,
  goblinBuilderEnabled: boolean,
): StartBlocker | null => {
  if (readUpgrade(village, target)) return "alreadyRunning";
  if (isInstantStep(step)) return null;
  const slot = builderSlots(village, goblinBuilderEnabled).slots.find((candidate) => candidate.id === builderId);
  if (!slot) return "noSuchBuilder";
  return slot.running ? "builderBusy" : null;
};

interface StartOptions {
  boostPercent: BoostPercent;
  now: Date;
}

/** Stores the boosted finish time. The raw duration stays on the queue item that started it. */
export const startUpgrade = (
  village: Playthrough,
  target: UpgradeTarget,
  step: UpgradeStep,
  builderId: number,
  { boostPercent, now }: StartOptions,
): Playthrough => {
  if (isInstantStep(step)) return completeUpgrade(village, target, now);
  const duration = applyBoost(step.durationMs, boostPercent);
  return writeUpgrade(village, target, {
    upgradeStartedAt: now.toISOString(),
    finishesAt: new Date(now.getTime() + duration).toISOString(),
    builderId,
  });
};

export const cancelUpgrade = (village: Playthrough, target: UpgradeTarget): Playthrough =>
  writeUpgrade(village, target, undefined);

const maxNormalLevel = (buildingId: string): number => {
  const steps = getBuildingUpgradeSteps(buildingId, 0, 99, 0, 0);
  const normal = steps.filter((step) => !step.isSupercharge);
  return normal.length === 0 ? 0 : Math.max(...normal.map((step) => step.level));
};

const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).toISOString();

/** True when the next step for this building is a supercharge, which writes `superchargeLevel`. */
const nextBuildingStepIsSupercharge = (village: Playthrough, target: Extract<UpgradeTarget, { kind: "building" }>) => {
  const instance = instanceAt(homeOf(village)[target.record], target.buildingId, target.instanceIndex);
  const steps = getBuildingUpgradeSteps(
    target.buildingId,
    instance?.level ?? 0,
    homeOf(village).townHallLevel,
    target.instanceIndex,
    instance?.superchargeLevel ?? 0,
  );
  return steps[0]?.isSupercharge === true;
};

/** Raises the level, clears the timer and writes the fields the finish changes. */
export const completeUpgrade = (village: Playthrough, target: UpgradeTarget, now: Date): Playthrough => {
  switch (target.kind) {
    case "building": {
      const supercharge = nextBuildingStepIsSupercharge(village, target);
      return withHome(village, (hv) =>
        writeBuildingInstance(hv, target, (instance) =>
          supercharge
            ? { ...instance, superchargeLevel: (instance.superchargeLevel ?? 0) + 1, upgrade: undefined }
            : { ...instance, level: instance.level + 1, upgrade: undefined },
        ),
      );
    }
    case "hero":
      return withHome(village, (hv) =>
        mapHero(hv, target.name, (hero) => ({ ...hero, level: hero.level + 1, upgrade: undefined })),
      );
    case "townHall": {
      const level = homeOf(village).townHallLevel + 1;
      const raised = withHome(village, (hv) => ({
        ...hv,
        townHallLevel: level,
        townHallUpgrade: undefined,
        ...(level === WEAPON_TOWN_HALL ? { townHallWeaponLevel: 1 } : {}),
      }));
      return { ...raised, thChangedAt: startOfUtcDay(now) };
    }
    case "townHallWeapon":
      return withHome(village, (hv) => ({
        ...hv,
        townHallWeaponLevel: (hv.townHallWeaponLevel ?? 0) + 1,
        townHallWeaponUpgrade: undefined,
      }));
    case "crafted":
      return withHome(village, (hv) =>
        writeCraftedModule(hv, target, (level) => ({ level: level + 1, upgrade: undefined })),
      );
  }
};

/** Time Passed saves nothing. Gems, a Book and a Hammer all add the time they skipped. */
export const finishUpgrade = (
  village: Playthrough,
  target: UpgradeTarget,
  method: FinishMethod,
  now: Date,
): FinishResult<Playthrough> => {
  const upgrade = readUpgrade(village, target);
  if (!upgrade) return { village, timeSavedMs: 0 };
  const remaining = Math.max(0, Date.parse(upgrade.finishesAt) - now.getTime());
  return {
    village: completeUpgrade(village, target, now),
    timeSavedMs: method === "timePassed" ? 0 : remaining,
  };
};

/** Completes every upgrade whose timer has ended, in one pass so one write saves them all. */
export const completeExpiredUpgrades = (
  village: Playthrough,
  now: Date,
): { village: Playthrough; completed: CompletedUpgrade[] } => {
  const expired = runningUpgrades(village)
    .filter(({ upgrade }) => Date.parse(upgrade.finishesAt) <= now.getTime())
    .sort((a, b) => Date.parse(a.upgrade.finishesAt) - Date.parse(b.upgrade.finishesAt));

  let current = village;
  const completed: CompletedUpgrade[] = [];
  for (const { target } of expired) {
    const fromLevel = readLevel(current, target);
    current = completeUpgrade(current, target, now);
    completed.push({ target, fromLevel, toLevel: readLevel(current, target) });
  }
  return { village: current, completed };
};

const clampLevel = (level: number) => Math.max(0, Math.floor(level));

/**
 * Sets a level by hand. A level below the top normal level of a building clears its supercharge,
 * and a Town Hall level change stamps `thChangedAt`.
 */
export const setLevel = (village: Playthrough, target: UpgradeTarget, level: number, now: Date): Playthrough => {
  const next = clampLevel(level);
  switch (target.kind) {
    case "building": {
      const normalMax = maxNormalLevel(target.buildingId);
      return withHome(village, (hv) =>
        writeBuildingInstance(hv, target, (instance) => ({
          ...instance,
          level: next,
          ...(next < normalMax ? { superchargeLevel: 0 } : {}),
        })),
      );
    }
    case "hero":
      return withHome(village, (hv) => mapHero(hv, target.name, (hero) => ({ ...hero, level: next })));
    case "townHall": {
      const raised = withHome(village, (hv) => ({
        ...hv,
        townHallLevel: Math.max(1, next),
        ...(next === WEAPON_TOWN_HALL && hv.townHallWeaponLevel === undefined ? { townHallWeaponLevel: 1 } : {}),
      }));
      return { ...raised, thChangedAt: startOfUtcDay(now) };
    }
    case "townHallWeapon":
      return withHome(village, (hv) => ({ ...hv, townHallWeaponLevel: next }));
    case "crafted":
      return withHome(village, (hv) => writeCraftedModule(hv, target, (_level, upgrade) => ({ level: next, upgrade })));
  }
};
