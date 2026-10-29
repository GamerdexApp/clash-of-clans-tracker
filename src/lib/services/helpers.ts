import { calculators } from "clash-of-clans-data";
import type { AlchemistLevel } from "clash-of-clans-data";
import alchemistJson from "clash-of-clans-data/data/home/other/helpers/alchemist.json";
import buildersApprenticeJson from "clash-of-clans-data/data/home/other/helpers/builders-apprentice.json";
import labAssistantJson from "clash-of-clans-data/data/home/other/helpers/lab-assistant.json";
import prospectorJson from "clash-of-clans-data/data/home/other/helpers/prospector.json";

import { dailiesOf, markUsed, withDailies } from "./dailies";
import {
  readAssignment,
  toAssignmentTarget,
  toUpgradeTarget,
  writeAssignment,
  type AssigningHelper,
} from "./helperAssignments";
import { readUpgrade, runningResearch, runningUpgrades, writeUpgrade } from "./upgradeEngine";
import type { Playthrough } from "@/types/app";
import type { RunningUpgrade, UpgradeTarget } from "@/types/app/engine";
import type { HelperAssignment, HelpersData } from "@/types/app/playthrough";

export type HelperId = AssigningHelper | "alchemist" | "prospector";
export const helperIds: HelperId[] = ["buildersApprentice", "labAssistant", "alchemist", "prospector"];

const HOUR_MS = 3_600_000;

interface AssistantLevel {
  level: number;
  workRate: number;
  upgradeCost: number;
  townHallRequired: number;
}

interface AlchemistLevelData {
  level: number;
  goldElixirConversionMax: number;
  darkElixirConversionMax: number;
  conversionBonusPercent: number;
  upgradeCost: number;
  townHallRequired: number;
}

const assistantLevels: Record<AssigningHelper, AssistantLevel[]> = {
  buildersApprentice: buildersApprenticeJson.levels,
  labAssistant: labAssistantJson.levels,
};

const alchemistLevels = alchemistJson.levels as AlchemistLevelData[];
const prospectorLimits = prospectorJson.levels[0];

export const helperTownHall: Record<HelperId, number> = {
  buildersApprentice: buildersApprenticeJson.townHallRequired,
  labAssistant: labAssistantJson.townHallRequired,
  alchemist: alchemistJson.townHallRequired,
  prospector: prospectorJson.townHallRequired,
};

export const helperImage: Record<HelperId, string> = {
  buildersApprentice: "images/home/other/helpers/builders-apprentice/normal.png",
  labAssistant: "images/home/other/helpers/lab-assistant/normal.png",
  alchemist: "images/home/other/helpers/alchemist/normal.png",
  prospector: "images/home/other/helpers/prospector/normal.png",
};

export const helperOpen = (id: HelperId, village: Playthrough): boolean =>
  village.data.homeVillage.townHallLevel >= helperTownHall[id];

export interface LevelOption {
  level: number;
  townHallRequired: number;
  gemCost: number;
}

export const levelOptions = (id: AssigningHelper | "alchemist"): LevelOption[] =>
  (id === "alchemist" ? alchemistLevels : assistantLevels[id]).map(({ level, townHallRequired, upgradeCost }) => ({
    level,
    townHallRequired,
    gemCost: upgradeCost,
  }));

const levelField = {
  buildersApprentice: "buildersApprenticeLevel",
  labAssistant: "labAssistantLevel",
  alchemist: "alchemistLevel",
} as const satisfies Record<string, keyof HelpersData>;

export const helperLevel = (village: Playthrough, id: AssigningHelper | "alchemist"): number | undefined =>
  dailiesOf(village).helpers[levelField[id]];

/** A level above the Town Hall is not offered, and None clears the level. */
export const setHelperLevel = (village: Playthrough, id: AssigningHelper | "alchemist", level: number | undefined): Playthrough => {
  const dailies = dailiesOf(village);
  return withDailies(village, { ...dailies, helpers: { ...dailies.helpers, [levelField[id]]: level } });
};

/** Work done in one use, in milliseconds of upgrade time. Zero until a level is chosen. */
export const workPerUseMs = (village: Playthrough, id: AssigningHelper): number => {
  const level = helperLevel(village, id);
  const workRate = assistantLevels[id].find((row) => row.level === level)?.workRate ?? 0;
  return workRate * HOUR_MS;
};

export interface AlchemistStats {
  goldElixirMax: number;
  darkElixirMax: number;
  bonusPercent: number;
}

export const alchemistStats = (level: number): AlchemistStats | null => {
  const row = alchemistLevels.find((candidate) => candidate.level === level);
  return row
    ? { goldElixirMax: row.goldElixirConversionMax, darkElixirMax: row.darkElixirConversionMax, bonusPercent: row.conversionBonusPercent }
    : null;
};

export type AlchemistResource = "gold" | "elixir" | "darkElixir";

// Only Gold or Elixir into Dark Elixir has a calculator in the data. The other directions use the 150 to 1 rate.
const RESOURCE_PER_DARK_ELIXIR = 150;

export const alchemistInputMax = (from: AlchemistResource, level: number): number => {
  const stats = alchemistStats(level);
  if (!stats) return 0;
  return from === "darkElixir" ? stats.darkElixirMax : stats.goldElixirMax;
};

export const alchemistOutput = (amount: number, from: AlchemistResource, to: AlchemistResource, level: number): number => {
  const stats = alchemistStats(level);
  if (!stats || from === to) return 0;
  if (to === "darkElixir") return calculators().helpers().alchemist(amount, level as AlchemistLevel).total;
  const base = from === "darkElixir" ? amount * RESOURCE_PER_DARK_ELIXIR : amount;
  return Math.floor(Math.floor(base) * (1 + stats.bonusPercent / 100));
};

export type Ore = "shiny" | "glowy" | "starry";

export const oreOrder: Ore[] = ["shiny", "glowy", "starry"];

const SHINY_PER_GLOWY = 10;
const GLOWY_PER_STARRY = 100;
const shinyValue: Record<Ore, number> = { shiny: 1, glowy: SHINY_PER_GLOWY, starry: SHINY_PER_GLOWY * GLOWY_PER_STARRY };

export const oreInputMax = (from: Ore): number =>
  from === "shiny"
    ? prospectorLimits.shinyOreConversionMax
    : from === "glowy"
      ? prospectorLimits.glowyOreConversionMax
      : prospectorLimits.starryOreConversionMax;

export const oreOutput = (amount: number, from: Ore, to: Ore): number =>
  from === to ? 0 : Math.floor((amount * shinyValue[from]) / shinyValue[to]);

const stillRunning = (running: RunningUpgrade[], now: Date): RunningUpgrade[] =>
  running.filter(({ upgrade }) => Date.parse(upgrade.finishesAt) > now.getTime());

/** The Builder's Apprentice helps any builder upgrade. The Lab Assistant helps research only. */
export const assignableUpgrades = (village: Playthrough, helper: AssigningHelper, now: Date): RunningUpgrade[] =>
  stillRunning(helper === "buildersApprentice" ? runningUpgrades(village) : runningResearch(village), now);

export interface HelperAssignmentView {
  assignment: HelperAssignment;
  target: UpgradeTarget;
  finishesAt: number;
}

/** The saved assignment, or null when it points at an upgrade that is no longer running. */
export const assignmentView = (village: Playthrough, helper: AssigningHelper, now: Date): HelperAssignmentView | null => {
  const assignment = readAssignment(village, helper);
  const target = assignment && toUpgradeTarget(assignment.target);
  if (!assignment || !target) return null;
  const upgrade = readUpgrade(village, target);
  if (!upgrade || Date.parse(upgrade.finishesAt) <= now.getTime()) return null;
  return { assignment, target, finishesAt: Date.parse(upgrade.finishesAt) };
};

export const assignUpgrade = (village: Playthrough, helper: AssigningHelper, target: UpgradeTarget | null): Playthrough => {
  const assignmentTarget = target && toAssignmentTarget(target);
  if (!assignmentTarget) return writeAssignment(village, helper, undefined);
  return writeAssignment(village, helper, { target: assignmentTarget, mode: readAssignment(village, helper)?.mode ?? "once" });
};

export const setAssignmentMode = (village: Playthrough, helper: AssigningHelper, mode: HelperAssignment["mode"]): Playthrough => {
  const assignment = readAssignment(village, helper);
  return assignment ? writeAssignment(village, helper, { ...assignment, mode }) : village;
};

export interface UsePreview {
  savedMs: number;
  remainingMs: number;
  afterMs: number;
}

/** What one use does to the assigned upgrade. Null with no level, no assignment or no running upgrade. */
export const previewHelperUse = (village: Playthrough, helper: AssigningHelper, now: Date): UsePreview | null => {
  const view = assignmentView(village, helper, now);
  const work = workPerUseMs(village, helper);
  if (!view || work === 0) return null;
  const remainingMs = view.finishesAt - now.getTime();
  const savedMs = Math.min(work, remainingMs);
  return { savedMs, remainingMs, afterMs: remainingMs - savedMs };
};

/**
 * Marks the daily timer used. For an assistant with a level and an assignment it also moves the
 * finish time of the assigned upgrade forward and clears a one time assignment, in the same change.
 */
export const applyHelperUse = (village: Playthrough, helper: HelperId, now: Date): Playthrough => {
  const used = withDailies(village, markUsed(dailiesOf(village), helper, now));
  if (helper === "alchemist" || helper === "prospector") return used;

  const preview = previewHelperUse(used, helper, now);
  const view = assignmentView(used, helper, now);
  if (!preview || !view) return used;

  const upgrade = readUpgrade(used, view.target)!;
  const shortened = writeUpgrade(used, view.target, {
    ...upgrade,
    finishesAt: new Date(view.finishesAt - preview.savedMs).toISOString(),
  });
  return view.assignment.mode === "once" ? writeAssignment(shortened, helper, undefined) : shortened;
};
