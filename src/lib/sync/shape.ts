import type { AppData } from "@/types/app";

/**
 * The sync package merges plain objects, lists of objects with a string key and lists of plain
 * values. The lists of this app that the package cannot merge by position are the building
 * instances, the levels of Clan Capital buildings, the modules of a crafted defense and the
 * achievements. In the shape that syncs, each of them is an object keyed by its position, so every
 * instance merges on its own. `fromSyncShape` turns the shape back into the saved data.
 */
type Plain = Record<string, unknown>;

const isPlain = (value: unknown): value is Plain => typeof value === "object" && value !== null && !Array.isArray(value);

const BUILDING_RECORDS = ["defenses", "traps", "resourceBuildings", "armyBuildings"] as const;
const CAPITAL_ZONES = [
  "capitalPeak",
  "barbarianCamp",
  "wizardValley",
  "balloonLagoon",
  "buildersWorkshop",
  "dragonCliffs",
  "golemQuarry",
  "skeletonPark",
  "goblinMines",
] as const;

const listToIndexed = (list: unknown): unknown =>
  Array.isArray(list) ? Object.fromEntries(list.map((value, index) => [String(index), value])) : list;

const indexedToList = (indexed: unknown, gap: unknown): unknown => {
  if (!isPlain(indexed)) return indexed;
  const positions = Object.keys(indexed).map(Number);
  const length = positions.length === 0 ? 0 : Math.max(...positions) + 1;
  return Array.from({ length }, (_, index) => (Object.hasOwn(indexed, String(index)) ? indexed[String(index)] : gap));
};

const mapRecord = (record: unknown, change: (value: unknown) => unknown): unknown =>
  isPlain(record) ? Object.fromEntries(Object.entries(record).map(([key, value]) => [key, change(value)])) : record;

const withChange = (target: unknown, key: string, change: (value: unknown) => unknown): unknown =>
  isPlain(target) && target[key] !== undefined ? { ...target, [key]: change(target[key]) } : target;

const achievementKey = (entry: Plain) => `${String(entry.village)}::${String(entry.name)}`;

const EMPTY_INSTANCE = { level: 0 };

type Direction = "toShape" | "fromShape";

const buildingRecord = (direction: Direction) => (record: unknown) =>
  mapRecord(record, (instances) => (direction === "toShape" ? listToIndexed(instances) : indexedToList(instances, EMPTY_INSTANCE)));

const capitalZone = (direction: Direction) => (zone: unknown) =>
  withChange(zone, "buildings", (buildings) =>
    mapRecord(buildings, (levels) => (direction === "toShape" ? listToIndexed(levels) : indexedToList(levels, 0))),
  );

const craftedDefenses = (direction: Direction) => (record: unknown) =>
  mapRecord(record, (defense) =>
    withChange(defense, "modules", (modules) => (direction === "toShape" ? listToIndexed(modules) : indexedToList(modules, 0))),
  );

const achievements = (direction: Direction) => (value: unknown): unknown => {
  if (direction === "toShape") {
    return Array.isArray(value) ? Object.fromEntries(value.filter(isPlain).map((entry) => [achievementKey(entry), entry])) : value;
  }
  return isPlain(value) ? Object.values(value) : value;
};

const village = (direction: Direction) => (value: unknown) => {
  const mapBuildings = (side: unknown) =>
    BUILDING_RECORDS.reduce((current, key) => withChange(current, key, buildingRecord(direction)), side);

  return withChange(value, "data", (data) => {
    let next = data;
    next = withChange(next, "homeVillage", (home) => withChange(mapBuildings(home), "craftedDefenses", craftedDefenses(direction)));
    next = withChange(next, "builderBase", mapBuildings);
    next = withChange(next, "clanCapital", (capital) => CAPITAL_ZONES.reduce((current, zone) => withChange(current, zone, capitalZone(direction)), capital));
    next = withChange(next, "achievements", achievements(direction));
    return next;
  });
};

const convert = (document: unknown, direction: Direction): unknown =>
  withChange(document, "playthroughs", (playthroughs) =>
    Array.isArray(playthroughs) ? playthroughs.map(village(direction)) : playthroughs,
  );

export const toSyncShape = (document: AppData): unknown => convert(document, "toShape");

export const fromSyncShape = (shape: unknown): AppData => convert(shape, "fromShape") as AppData;
