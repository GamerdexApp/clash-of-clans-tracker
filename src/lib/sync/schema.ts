import type { Schema } from "@gamerdexapp/gamerdex-sync";

const dateOrder = (value: unknown) => (typeof value === "string" ? Date.parse(value) || 0 : 0);
const numberOrder = (value: unknown) => Number(value) || 0;

const level: Schema = { type: "max", order: numberOrder };
const latest: Schema = { type: "max", order: dateOrder };

/** A building instance. A running upgrade is one record, so its start, finish and builder never mix. */
const instance: Schema = { type: "object", fields: { level, superchargeLevel: level } };
const buildingRecord: Schema = { type: "object", each: { type: "object", each: instance } };

const trackedItem: Schema = { type: "object", fields: { level } };
const trackedList: Schema = { type: "keyed", key: "name", item: trackedItem };
const heroes: Schema = {
  type: "keyed",
  key: "name",
  item: { type: "object", fields: { level, equipment: trackedList } },
};

const homeVillage: Schema = {
  type: "object",
  fields: {
    townHallLevel: level,
    bestTrophies: level,
    attackWins: level,
    defenseWins: level,
    townHallWeaponLevel: level,
    troops: trackedList,
    spells: trackedList,
    siegeMachines: trackedList,
    pets: trackedList,
    heroes,
    defenses: buildingRecord,
    traps: buildingRecord,
    resourceBuildings: buildingRecord,
    armyBuildings: buildingRecord,
    craftedDefenses: { type: "object", each: { type: "object", fields: { modules: { type: "object", each: level } } } },
  },
};

const builderBase: Schema = {
  type: "object",
  fields: {
    builderHallLevel: level,
    bestBuilderBaseTrophies: level,
    troops: trackedList,
    heroes,
    defenses: buildingRecord,
    traps: buildingRecord,
    resourceBuildings: buildingRecord,
    armyBuildings: buildingRecord,
  },
};

const capitalZone: Schema = {
  type: "object",
  fields: { hallLevel: level, buildings: { type: "object", each: { type: "object", each: level } } },
};

const clanCapital: Schema = {
  type: "object",
  fields: {
    clanCapitalContributions: level,
    capitalPeak: capitalZone,
    barbarianCamp: capitalZone,
    wizardValley: capitalZone,
    balloonLagoon: capitalZone,
    buildersWorkshop: capitalZone,
    dragonCliffs: capitalZone,
    golemQuarry: capitalZone,
    skeletonPark: capitalZone,
    goblinMines: capitalZone,
    troops: trackedList,
    spells: trackedList,
  },
};

const achievements: Schema = {
  type: "object",
  each: { type: "object", fields: { stars: level, value: level } },
};

const villageData: Schema = {
  type: "object",
  fields: {
    expLevel: level,
    warStars: level,
    donations: level,
    donationsReceived: level,
    homeVillage,
    builderBase,
    clanCapital,
    achievements,
  },
};

/** A daily timer: the later use wins. The reset time is one value, so two different times report a conflict. */
const timer: Schema = { type: "object", fields: { lastCollectedAt: latest } };

const dailies: Schema = {
  type: "object",
  fields: {
    starBonus: timer,
    capitalGold: timer,
    helpers: {
      type: "object",
      fields: { prospector: timer, alchemist: timer, buildersApprentice: timer, labAssistant: timer },
    },
  },
};

const village: Schema = {
  type: "object",
  fields: { lastModified: latest, thChangedAt: latest, bhChangedAt: latest, dailies, data: villageData },
};

/**
 * The data file is the saved data of the app in the shape of `shape.ts`. Levels take the higher
 * side, because a level only goes up in the game. A reset on one device carries over when the other
 * device did not change that level. Lists of named things merge by name, and each building instance
 * merges on its own. A value that cannot merge, such as a name, a trophy count, a queue or a running
 * upgrade, reports a conflict when both devices changed it, and the player picks. The active village
 * belongs to each device and never syncs.
 */
export const syncSchema: Schema = {
  type: "object",
  fields: {
    playthroughs: { type: "keyed", key: "id", item: village },
    activePlaythroughId: { type: "local" },
    settings: { type: "object" },
  },
};
