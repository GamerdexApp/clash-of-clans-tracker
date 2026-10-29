import { homeWalls } from "./walls";
import { setEquipmentLevel, equipmentLevel } from "./equipment";
import { readLevel, readUpgrade, setLevel } from "./upgradeEngine";
import {
  getAllEquipment,
  getArmyBuildingsAtTH,
  getCraftedDefenses,
  getDefensesAtTH,
  getGuardiansAtTH,
  getHeroesAtTH,
  getOtherBuildingsAtTH,
  getPetsAtTH,
  getResourceBuildingsAtTH,
  getSiegeMachinesAtTH,
  getSpellsAtTH,
  getTrapsAtTH,
  getTroopsAtTH,
  type BuildingEditData,
  type ItemEditData,
} from "@/lib/utils/massEditHelpers";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { BuildingRecordKey, ResearchKey } from "@/types/app/game";

export type MassScope = "home" | "builder" | "capital";

type BuildingTarget = Extract<UpgradeTarget, { kind: "building" }>;

/** Names one editable value of a village, so a draft can be read, written and compared per row. */
export type RowRef =
  | { kind: "upgrade"; target: UpgradeTarget }
  | { kind: "supercharge"; target: BuildingTarget }
  | { kind: "equipment"; hero: string; piece: string }
  | { kind: "wall"; level: number };

export interface MassRow {
  key: string;
  ref: RowRef;
  label: string;
  imageUrl: string;
  max: number;
  /** A header above the rows that share it, such as one building with several instances. */
  group?: string;
  /** A heading above several groups, such as Army buildings and Other buildings. */
  section?: string;
  /** Why a level edit is blocked, such as a running timer. */
  blocked?: string;
  /** Present on a building row that has Supercharge tiers. */
  supercharge?: { row: MassRow; requiredLevel: number };
}

export interface MassCategory {
  id: string;
  label: string;
  rows: MassRow[];
  /** The requirement text of a category the village cannot use yet. */
  requirement?: string;
  isWalls?: boolean;
  /** One line under the toolbar that says what the category lists. */
  note?: string;
}

const CRAFTED_TOWN_HALL = 18;
const PETS_TOWN_HALL = 14;

export const keyOf = (ref: RowRef) => JSON.stringify(ref);

const makeRow = (ref: RowRef, fields: Omit<MassRow, "key" | "ref">): MassRow => ({ key: keyOf(ref), ref, ...fields });

const buildingRows = (
  buildings: BuildingEditData[],
  record: BuildingRecordKey,
  section?: string,
): MassRow[] =>
  buildings.flatMap((building) =>
    Array.from({ length: building.instanceCount }, (_, instanceIndex) => {
      const target: BuildingTarget = { kind: "building", record, buildingId: building.id, instanceIndex };
      const label = building.instanceCount > 1 ? `${building.name} #${instanceIndex + 1}` : building.name;
      const row = makeRow({ kind: "upgrade", target }, {
        label,
        imageUrl: building.imageUrl,
        max: building.maxLevel,
        group: building.name,
        section,
      });
      if (building.superchargeTiers === 0) return row;
      const supercharge = makeRow(
        { kind: "supercharge", target },
        { label: `${label} supercharge`, imageUrl: building.imageUrl, max: building.superchargeTiers, group: building.name, section },
      );
      return { ...row, supercharge: { row: supercharge, requiredLevel: building.maxLevel } };
    }),
  );

const itemRows = (items: ItemEditData[], target: (name: string) => UpgradeTarget): MassRow[] =>
  items.map((item) => makeRow({ kind: "upgrade", target: target(item.name) }, { label: item.name, imageUrl: item.imageUrl, max: item.maxLevel }));

const researchRows = (items: ItemEditData[], record: ResearchKey) =>
  itemRows(items, (name) => ({ kind: "research", record, name }));

const wallRows = (townHall: number): MassRow[] =>
  homeWalls.wallLevelsAt(townHall).map((level) =>
    makeRow({ kind: "wall", level: level.level }, { label: `Level ${level.level}`, imageUrl: level.imageUrl, max: 0 }),
  );

/** The thirteen Home Village categories for a Town Hall. `townHall` can differ from the village for the Set to max for hall action. */
export const homeCategories = (village: Playthrough, townHall = village.data.homeVillage.townHallLevel): MassCategory[] => {
  const heroes = getHeroesAtTH(townHall).filter((hero, index, all) => all.findIndex((other) => other.name === hero.name) === index);
  const heroName = (id: string) => heroes.find((hero) => hero.id === id)?.name;
  const crafted = townHall >= CRAFTED_TOWN_HALL ? getCraftedDefenses() : [];

  return [
    { id: "defenses", label: "Defenses", rows: buildingRows(getDefensesAtTH(townHall), "defenses") },
    {
      id: "army",
      label: "Army",
      rows: [
        ...buildingRows(getArmyBuildingsAtTH(townHall), "armyBuildings", "Army buildings"),
        ...buildingRows(getOtherBuildingsAtTH(townHall), "armyBuildings", "Other buildings"),
      ],
    },
    { id: "resources", label: "Resources", rows: buildingRows(getResourceBuildingsAtTH(townHall), "resourceBuildings") },
    {
      id: "crafted",
      label: "Crafted Defenses",
      requirement: townHall >= CRAFTED_TOWN_HALL ? undefined : `Town Hall ${CRAFTED_TOWN_HALL}`,
      rows: crafted.flatMap((defense) =>
        defense.modules.map((module, moduleIndex) => {
          const target: UpgradeTarget = { kind: "crafted", defenseId: defense.id, moduleIndex };
          const running = readUpgrade(village, target) !== undefined;
          return makeRow(
            { kind: "upgrade", target },
            {
              label: module.name,
              imageUrl: defense.imageUrl,
              max: module.maxLevel,
              group: defense.name,
              blocked: running ? "Timer running" : undefined,
            },
          );
        }),
      ),
    },
    { id: "traps", label: "Traps", rows: buildingRows(getTrapsAtTH(townHall), "traps") },
    { id: "troops", label: "Troops", rows: researchRows(getTroopsAtTH(townHall), "troops") },
    { id: "spells", label: "Spells", rows: researchRows(getSpellsAtTH(townHall), "spells") },
    { id: "siege", label: "Siege", rows: researchRows(getSiegeMachinesAtTH(townHall), "siegeMachines") },
    {
      id: "pets",
      label: "Pets",
      requirement: townHall >= PETS_TOWN_HALL ? undefined : `Town Hall ${PETS_TOWN_HALL}`,
      rows: itemRows(getPetsAtTH(townHall), (name) => ({ kind: "pet", name })),
    },
    {
      id: "guardians",
      label: "Guardians",
      requirement: townHall >= CRAFTED_TOWN_HALL ? undefined : `Town Hall ${CRAFTED_TOWN_HALL}`,
      rows: buildingRows(getGuardiansAtTH(townHall), "defenses"),
    },
    {
      id: "heroes",
      label: "Heroes",
      rows: heroes.map((hero) =>
        makeRow({ kind: "upgrade", target: { kind: "hero", name: hero.name } }, { label: hero.name, imageUrl: hero.imageUrl, max: hero.maxLevel }),
      ),
    },
    {
      id: "equipment",
      label: "Equipment",
      rows: getAllEquipment().flatMap((piece) => {
        const hero = heroName(piece.heroId);
        return hero
          ? [makeRow({ kind: "equipment", hero, piece: piece.name }, { label: piece.name, imageUrl: piece.imageUrl, max: piece.maxLevel, group: hero })]
          : [];
      }),
    },
    { id: "walls", label: "Walls", isWalls: true, rows: wallRows(townHall) },
  ];
};

export const readRow = (village: Playthrough, ref: RowRef): number => {
  switch (ref.kind) {
    case "upgrade":
      return readLevel(village, ref.target);
    case "supercharge":
      return village.data.homeVillage[ref.target.record][ref.target.buildingId]?.[ref.target.instanceIndex]?.superchargeLevel ?? 0;
    case "equipment":
      return equipmentLevel(village, ref.hero, ref.piece);
    case "wall":
      return homeWalls.wallCount(village, ref.level);
  }
};

const writeSupercharge = (village: Playthrough, target: BuildingTarget, level: number): Playthrough => {
  const hv = village.data.homeVillage;
  const instances = hv[target.record][target.buildingId];
  if (!instances?.[target.instanceIndex]) return village;
  const next = instances.map((instance, index) => (index === target.instanceIndex ? { ...instance, superchargeLevel: level } : instance));
  return {
    ...village,
    data: { ...village.data, homeVillage: { ...hv, [target.record]: { ...hv[target.record], [target.buildingId]: next } } },
  };
};

export const writeRow = (village: Playthrough, ref: RowRef, level: number, now: Date): Playthrough => {
  switch (ref.kind) {
    case "upgrade":
      return setLevel(village, ref.target, level, now);
    case "supercharge":
      return writeSupercharge(village, ref.target, level);
    case "equipment":
      return setEquipmentLevel(village, ref.hero, ref.piece, level);
    case "wall":
      return homeWalls.setWallCount(village, ref.level, level);
  }
};

/** The most a row can hold. A wall level holds what it has plus the walls still to place. */
export const rowMax = (village: Playthrough, row: MassRow): number =>
  row.ref.kind === "wall" ? homeWalls.maxCountFor(village, row.ref.level) : row.max;

export interface RowChange {
  row: MassRow;
  from: number;
  to: number;
}

const withSupercharge = (rows: MassRow[]): MassRow[] => rows.flatMap((row) => (row.supercharge ? [row, row.supercharge.row] : [row]));

export const allRows = (categories: MassCategory[]): MassRow[] => categories.flatMap((category) => withSupercharge(category.rows));

/** Every row whose value differs between two villages. */
export const changedRows = (rows: MassRow[], before: Playthrough, after: Playthrough): RowChange[] =>
  rows.flatMap((row) => {
    const from = readRow(before, row.ref);
    const to = readRow(after, row.ref);
    return from === to ? [] : [{ row, from, to }];
  });

/** Copies the changes of a draft onto the latest village. Lowering comes first so wall counts never hit the total. */
export const applyChanges = (latest: Playthrough, changes: RowChange[], now: Date): Playthrough =>
  [...changes]
    .sort((a, b) => a.to - a.from - (b.to - b.from))
    .reduce((current, { row, to }) => writeRow(current, row.ref, to, now), latest);

export type BulkAction =
  | { kind: "max" }
  | { kind: "reset" }
  | { kind: "level"; level: number }
  | { kind: "hall"; categories: MassCategory[] };

const bulkTarget = (row: MassRow, action: BulkAction): number => {
  switch (action.kind) {
    case "max":
      return row.max;
    case "reset":
      return 0;
    case "level":
      return Math.min(row.max, Math.max(0, action.level));
    case "hall":
      return allRows(action.categories).find((candidate) => candidate.key === row.key)?.max ?? 0;
  }
};

/** What a bulk action would do to a draft, row by row. Rows with a blocked edit and Supercharge rows stay out. */
export const planBulk = (draft: Playthrough, rows: MassRow[], action: BulkAction): RowChange[] =>
  rows.flatMap((row) => {
    if (row.blocked || row.ref.kind === "supercharge") return [];
    const from = readRow(draft, row.ref);
    const to = row.ref.kind === "wall" ? from : bulkTarget(row, action);
    return to === from ? [] : [{ row, from, to }];
  });

export const applyBulk = (draft: Playthrough, changes: RowChange[], now: Date): Playthrough => applyChanges(draft, changes, now);

export const lowers = (changes: RowChange[]) => changes.filter((change) => change.to < change.from);

/** Rows at their maximum out of all rows, for the category pill. Walls count placed out of the total. */
export const categoryProgress = (village: Playthrough, category: MassCategory): { done: number; total: number } => {
  if (category.isWalls) {
    const hall = village.data.homeVillage.townHallLevel;
    return { done: homeWalls.placedWalls(village), total: homeWalls.totalWallsAt(hall) };
  }
  return {
    done: category.rows.filter((row) => readRow(village, row.ref) >= row.max).length,
    total: category.rows.length,
  };
};
