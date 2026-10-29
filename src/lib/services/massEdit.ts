import {
  capitalArmy,
  capitalHallOf,
  capitalZones,
  changeCapitalHall,
  changeZoneHall,
  groupBuildings,
  maxDistrictHall,
  placedWalls as zonePlacedWalls,
  setArmyLevel,
  setContributions,
  setWallCount as setZoneWallCount,
  wallCountAt as zoneWallCount,
  zoneData,
  zoneHall,
  zoneLabel,
  zoneUnlockLevel,
  zoneWalls,
} from "./capital";
import { builderLeagues, setBestTrophies, setLeague, setTrophies } from "./builderBaseProfile";
import { builderWalls, homeWalls } from "./walls";
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
import {
  getBuilderArmyBuildingsAtBH,
  getBuilderDefensesAtBH,
  getBuilderHeroesAtBH,
  getBuilderResourceBuildingsAtBH,
  getBuilderTrapsAtBH,
  getBuilderTroopsAtBH,
} from "@/lib/utils/massEditBuilderHelpers";
import type { ZoneId } from "@/types/app/capital";
import type { UpgradeTarget } from "@/types/app/engine";
import type { BuildingRecordKey, ResearchKey } from "@/types/app/game";

export type MassScope = "home" | "builder" | "capital";

type BuildingTarget = Extract<UpgradeTarget, { kind: "building" }>;

/** Names one editable value of a village, so a draft can be read, written and compared per row. */
export type RowRef =
  | { kind: "upgrade"; target: UpgradeTarget }
  | { kind: "supercharge"; target: BuildingTarget }
  | { kind: "equipment"; hero: string; piece: string }
  | { kind: "wall"; side: "home" | "builder"; level: number }
  | { kind: "profile"; field: "trophies" | "bestTrophies" | "league" | "contributions" }
  | { kind: "capitalBuilding"; zone: ZoneId; id: string; instance: number }
  | { kind: "capitalWall"; zone: ZoneId; level: number }
  | { kind: "capitalArmy"; army: "troops" | "spells"; name: string }
  | { kind: "capitalHall"; zone: ZoneId };

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
  /** The village the wall counts belong to. */
  side?: "home" | "builder";
  /** The zone the wall counts belong to, for Clan Capital. */
  zone?: ZoneId;
  /** Sub tabs of a zone: Defenses, Traps, Buildings and Walls. `rows` holds all of them. */
  parts?: MassCategory[];
  /** One line under the toolbar that says what the category lists. */
  note?: string;
}

const CRAFTED_TOWN_HALL = 18;
const PETS_TOWN_HALL = 14;

const wallRules = (side: "home" | "builder") => (side === "home" ? homeWalls : builderWalls);

/** The scope a row belongs to, so each scope tab can count its own changes. */
export const scopeOf = (ref: RowRef): MassScope => {
  if (ref.kind === "wall") return ref.side === "home" ? "home" : "builder";
  if (ref.kind === "profile") return ref.field === "contributions" ? "capital" : "builder";
  if (ref.kind === "capitalBuilding" || ref.kind === "capitalWall" || ref.kind === "capitalArmy" || ref.kind === "capitalHall") return "capital";
  if (ref.kind === "upgrade") {
    return ["bbBuilding", "bbHero", "bbTroop", "builderHall", "clockTower"].includes(ref.target.kind) ? "builder" : "home";
  }
  return "home";
};

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

const wallRows = (side: "home" | "builder", hall: number): MassRow[] =>
  wallRules(side).wallLevelsAt(hall).map((level) =>
    makeRow({ kind: "wall", side, level: level.level }, { label: `Level ${level.level}`, imageUrl: level.imageUrl, max: 0 }),
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
    { id: "walls", label: "Walls", isWalls: true, side: "home", rows: wallRows("home", townHall) },
  ];
};

const bbBuildingRows = (buildings: BuildingEditData[], record: BuildingRecordKey, section?: string): MassRow[] =>
  buildings.flatMap((building) =>
    Array.from({ length: building.instanceCount }, (_, instanceIndex) =>
      makeRow(
        { kind: "upgrade", target: { kind: "bbBuilding", record, buildingId: building.id, instanceIndex } },
        {
          label: building.instanceCount > 1 ? `${building.name} #${instanceIndex + 1}` : building.name,
          imageUrl: building.imageUrl,
          max: building.maxLevel,
          group: building.name,
          section,
        },
      ),
    ),
  );

/** The seven Builder Base categories for a Builder Hall. `builderHall` can differ from the village for the Set to max for hall action. */
export const builderCategories = (village: Playthrough, builderHall = village.data.builderBase.builderHallLevel): MassCategory[] => [
  { id: "defenses", label: "Defenses", rows: bbBuildingRows(getBuilderDefensesAtBH(builderHall), "defenses") },
  { id: "army", label: "Army", rows: bbBuildingRows(getBuilderArmyBuildingsAtBH(builderHall), "armyBuildings") },
  { id: "resources", label: "Resources", rows: bbBuildingRows(getBuilderResourceBuildingsAtBH(builderHall), "resourceBuildings") },
  { id: "traps", label: "Traps", rows: bbBuildingRows(getBuilderTrapsAtBH(builderHall), "traps") },
  {
    id: "troops",
    label: "Troops",
    rows: getBuilderTroopsAtBH(builderHall).map((troop) =>
      makeRow({ kind: "upgrade", target: { kind: "bbTroop", name: troop.name } }, { label: troop.name, imageUrl: troop.imageUrl, max: troop.maxLevel }),
    ),
  },
  {
    id: "heroes",
    label: "Heroes",
    rows: getBuilderHeroesAtBH(builderHall).map((hero) =>
      makeRow({ kind: "upgrade", target: { kind: "bbHero", name: hero.name } }, { label: hero.name, imageUrl: hero.imageUrl, max: hero.maxLevel }),
    ),
  },
  { id: "walls", label: "Walls", isWalls: true, side: "builder", rows: wallRows("builder", builderHall) },
];

const profileRow = (ref: RowRef, label: string): MassRow => makeRow(ref, { label, imageUrl: "", max: 0 });

/** The Builder Hall and profile fields of the Builder Base scope. They are not listed as rows, but they count as changes. */
export const builderProfileRows = (): MassRow[] => [
  profileRow({ kind: "upgrade", target: { kind: "builderHall" } }, "Builder Hall level"),
  profileRow({ kind: "profile", field: "trophies" }, "Trophies"),
  profileRow({ kind: "profile", field: "bestTrophies" }, "Best trophies"),
  profileRow({ kind: "profile", field: "league" }, "League"),
];

export const readRow = (village: Playthrough, ref: RowRef): number => {
  switch (ref.kind) {
    case "upgrade":
      return readLevel(village, ref.target);
    case "supercharge":
      return village.data.homeVillage[ref.target.record][ref.target.buildingId]?.[ref.target.instanceIndex]?.superchargeLevel ?? 0;
    case "equipment":
      return equipmentLevel(village, ref.hero, ref.piece);
    case "wall":
      return wallRules(ref.side).wallCount(village, ref.level);
    case "capitalBuilding":
      return zoneData(village, ref.zone).buildings[ref.id]?.[ref.instance] ?? 0;
    case "capitalWall":
      return zoneWallCount(village, ref.zone, ref.level);
    case "capitalArmy":
      return village.data.clanCapital[ref.army].find((item) => item.name === ref.name)?.level ?? 0;
    case "capitalHall":
      return zoneHall(village, ref.zone);
    case "profile":
      if (ref.field === "contributions") return village.data.clanCapital.clanCapitalContributions;
      return ref.field === "trophies"
        ? village.data.builderBase.builderBaseTrophies
        : ref.field === "bestTrophies"
          ? village.data.builderBase.bestBuilderBaseTrophies
          : builderLeagues().findIndex((league) => league.storedName === village.data.builderBase.builderBaseLeagueName);
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
      return wallRules(ref.side).setWallCount(village, ref.level, level);
    case "capitalBuilding": {
      const levels = Array.from({ length: Math.max(ref.instance + 1, zoneData(village, ref.zone).buildings[ref.id]?.length ?? 0) }, (_, index) =>
        index === ref.instance ? level : (zoneData(village, ref.zone).buildings[ref.id]?.[index] ?? 0),
      );
      const zone = zoneData(village, ref.zone);
      return {
        ...village,
        data: {
          ...village.data,
          clanCapital: { ...village.data.clanCapital, [ref.zone]: { ...zone, buildings: { ...zone.buildings, [ref.id]: levels } } },
        },
      };
    }
    case "capitalWall":
      return setZoneWallCount(village, ref.zone, ref.level, level);
    case "capitalArmy":
      return setArmyLevel(village, ref.army, ref.name, level);
    case "capitalHall":
      return ref.zone === "capitalPeak" ? changeCapitalHall(village, level).village : changeZoneHall(village, ref.zone, level).village;
    case "profile":
      if (ref.field === "contributions") return setContributions(village, level);
      return ref.field === "trophies"
        ? setTrophies(village, level)
        : ref.field === "bestTrophies"
          ? setBestTrophies(village, level)
          : setLeague(village, builderLeagues()[level]?.storedName ?? village.data.builderBase.builderBaseLeagueName);
  }
};

/** The most a row can hold. A wall level holds what it has plus the walls still to place. */
export const rowMax = (village: Playthrough, row: MassRow): number =>
  row.ref.kind === "wall"
    ? wallRules(row.ref.side).maxCountFor(village, row.ref.level)
    : row.ref.kind === "capitalWall"
      ? zoneWalls(row.ref.zone, zoneHall(village, row.ref.zone)).totalCount - zonePlacedWalls(village, row.ref.zone) + zoneWallCount(village, row.ref.zone, row.ref.level)
      : row.max;

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
    .sort((a, b) => Number(b.row.ref.kind === "capitalHall") - Number(a.row.ref.kind === "capitalHall") || a.to - a.from - (b.to - b.from))
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
    if (row.blocked || row.ref.kind === "supercharge" || row.ref.kind === "profile" || row.ref.kind === "capitalHall") return [];
    const from = readRow(draft, row.ref);
    const to = row.ref.kind === "wall" || row.ref.kind === "capitalWall" ? from : bulkTarget(row, action);
    return to === from ? [] : [{ row, from, to }];
  });

export const applyBulk = (draft: Playthrough, changes: RowChange[], now: Date): Playthrough => applyChanges(draft, changes, now);

export const lowers = (changes: RowChange[]) => changes.filter((change) => change.to < change.from);

/** Rows at their maximum out of all rows, for the category pill. Walls count placed out of the total. */
export const categoryProgress = (village: Playthrough, category: MassCategory): { done: number; total: number } => {
  if (category.isWalls) {
    const { placed, total } = wallStats(village, category);
    return { done: placed, total };
  }
  if (category.parts) {
    const parts = category.parts.map((part) => categoryProgress(village, part));
    return { done: parts.reduce((sum, part) => sum + part.done, 0), total: parts.reduce((sum, part) => sum + part.total, 0) };
  }
  return {
    done: category.rows.filter((row) => readRow(village, row.ref) >= row.max).length,
    total: category.rows.length,
  };
};

/** Rows a lower Builder Hall no longer holds at their level: above the new limit, or missing at that hall. */
export const planBuilderHallLowering = (draft: Playthrough, level: number): RowChange[] => {
  const atNewHall = new Map(allRows(builderCategories(draft, level)).map((row) => [row.key, row.max]));
  return allRows(builderCategories(draft))
    .filter((row) => row.ref.kind !== "wall")
    .flatMap((row) => {
      const from = readRow(draft, row.ref);
      const to = Math.min(from, atNewHall.get(row.key) ?? 0);
      return to === from ? [] : [{ row, from, to }];
    });
};

/** Sets the Builder Hall level. Raising only raises limits. Lowering takes the planned rows down with it. */
export const setBuilderHall = (draft: Playthrough, level: number, lowered: RowChange[], now: Date): Playthrough =>
  setLevel(applyChanges(draft, lowered, now), { kind: "builderHall" }, level, now);

const capitalBuildingRows = (zone: ZoneId, buildings: BuildingEditData[]): MassRow[] =>
  buildings.flatMap((building) =>
    Array.from({ length: building.instanceCount }, (_, instance) =>
      makeRow(
        { kind: "capitalBuilding", zone, id: building.id, instance },
        {
          label: building.instanceCount > 1 ? `${building.name} #${instance + 1}` : building.name,
          imageUrl: building.imageUrl,
          max: building.maxLevel,
          group: building.name,
        },
      ),
    ),
  );

const zoneCategory = (zone: ZoneId, hall: number, capitalHall: number): MassCategory => {
  const open = capitalHall >= zoneUnlockLevel(zone);
  const wallInfo = zoneWalls(zone, hall);
  const walls: MassCategory = {
    id: "walls",
    label: "Walls",
    isWalls: true,
    zone,
    rows: wallInfo.levels.map((level) =>
      makeRow({ kind: "capitalWall", zone, level: level.level }, { label: `Level ${level.level}`, imageUrl: level.imageUrl, max: 0 }),
    ),
  };
  const parts: MassCategory[] = [
    { id: "defenses", label: "Defenses", rows: capitalBuildingRows(zone, groupBuildings(zone, hall, "defenses")) },
    { id: "traps", label: "Traps", rows: capitalBuildingRows(zone, groupBuildings(zone, hall, "traps")) },
    { id: "buildings", label: "Buildings", rows: capitalBuildingRows(zone, groupBuildings(zone, hall, "army")) },
    walls,
  ].filter((part) => part.rows.length > 0);
  return {
    id: zone,
    label: zone === "capitalPeak" ? "Capital Hall" : zoneLabel(zone),
    requirement: open ? undefined : `Capital Hall ${zoneUnlockLevel(zone)}`,
    zone,
    parts,
    rows: parts.flatMap((part) => part.rows),
  };
};

const armyCategory = (village: Playthrough, army: "troops" | "spells"): MassCategory => ({
  id: army,
  label: army === "troops" ? "Troops" : "Spells",
  note: "Lists the troops and spells a District Hall unlocks. Each is capped by that hall.",
  rows: capitalArmy(village)
    .filter((entry) => entry.kind === army && entry.maxLevel > 0)
    .map((entry) =>
      makeRow({ kind: "capitalArmy", army, name: entry.name }, { label: entry.name, imageUrl: entry.imageUrl, max: entry.maxLevel, group: entry.district }),
    ),
});

/**
 * The eleven Clan Capital categories: Capital Peak, the eight districts, troops and spells.
 * `zone` and `hall` show one zone as it would be at another hall, for the Set to max for hall level action.
 */
export const capitalCategories = (village: Playthrough, override?: { zone: ZoneId; hall: number }): MassCategory[] => {
  const capitalHall = capitalHallOf(village);
  return [
    ...capitalZones.map((zone) =>
      zoneCategory(zone.id, override?.zone === zone.id ? override.hall : zoneHall(village, zone.id), capitalHall),
    ),
    armyCategory(village, "troops"),
    armyCategory(village, "spells"),
  ];
};

/** Every zone hall and the contributions. They are not listed as rows, but they count as changes. */
export const capitalProfileRows = (): MassRow[] => [
  ...capitalZones.map((zone) => profileRow({ kind: "capitalHall", zone: zone.id }, zone.id === "capitalPeak" ? "Capital Hall" : `${zone.label} District Hall`)),
  profileRow({ kind: "profile", field: "contributions" }, "Contributions"),
];

/** Wall totals for any wall category. */
export const wallStats = (village: Playthrough, category: MassCategory): { total: number; placed: number } => {
  if (category.zone) {
    return { total: zoneWalls(category.zone, zoneHall(village, category.zone)).totalCount, placed: zonePlacedWalls(village, category.zone) };
  }
  const rules = wallRules(category.side ?? "home");
  return { total: rules.totalWallsAt(rules.hallLevel(village)), placed: rules.placedWalls(village) };
};

/** The hall that caps the rows of a category, or null for troops and spells. */
export const hallOfCategory = (village: Playthrough, category: MassCategory): { zone: ZoneId; level: number } | null =>
  category.zone ? { zone: category.zone, level: zoneHall(village, category.zone) } : null;

/** The highest District Hall a zone can have with this Capital Hall. */
export const zoneHallLimit = (zone: ZoneId, capitalHall: number) => maxDistrictHall(zone, capitalHall);

