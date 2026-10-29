import { calculators, clanCapital } from "clash-of-clans-data";

import { goldPassBoosts } from "./goldPass";
import { dailiesOf, withDailies } from "./dailies";
import type { Playthrough } from "@/types/app";
import type { BoostPercent } from "@/types/app/engine";
import type { AutoForgeData, ForgeResourceType, ForgeSlotData } from "@/types/app/playthrough";

const forge = clanCapital().forge();

export const FORGE_SLOT_COUNT = 4;

export type ForgeMode = "manual" | "auto";
export type SlotState = "idle" | "running" | "done";

export interface ForgeResource {
  type: ForgeResourceType;
  label: string;
  shortLabel: string;
  image: string;
}

export const forgeResources: ForgeResource[] = [
  { type: "gold", label: "Gold", shortLabel: "Gold", image: "images/other/gold.png" },
  { type: "elixir", label: "Elixir", shortLabel: "Elixir", image: "images/other/elixir.png" },
  { type: "darkElixir", label: "Dark Elixir", shortLabel: "Dark", image: "images/other/dark-elixir.png" },
  { type: "builderGold", label: "Builder Gold", shortLabel: "B. Gold", image: "images/other/gold-b.png" },
  { type: "builderElixir", label: "Builder Elixir", shortLabel: "B. Elixir", image: "images/other/elixir-b.png" },
];

export const forgeResource = (type: ForgeResourceType): ForgeResource =>
  forgeResources.find((resource) => resource.type === type)!;

const isBuilderResource = (type: ForgeResourceType) => type === "builderGold" || type === "builderElixir";

export interface ForgeRate {
  type: ForgeResourceType;
  /** Resource spent for one run, 0 when the village cannot forge this resource. */
  cost: number;
  capitalGold: number;
  available: boolean;
  /** The hall the village is missing, such as "Town Hall 13". */
  requirement: string | null;
}

const firstRateTownHall = forge.forgeRates().home[0].townHallLevel;
const darkElixirTownHall = forge.forgeRates().home.find((rate) => rate.darkElixirCost !== undefined)!.townHallLevel;
const builderResourceHall = forge.forgeRates().builder[0].builderHallLevel;

/** One run of a resource. The data has no row below the first Town Hall or Builder Hall with a forge rate. */
export const forgeRate = (type: ForgeResourceType, mode: ForgeMode, townHall: number, builderHall: number): ForgeRate => {
  if (isBuilderResource(type)) {
    const row = mode === "auto" ? forge.autoForgeAtBuilderHall(builderHall) : forge.forgeAtBuilderHall(builderHall);
    if (!row) return { type, cost: 0, capitalGold: 0, available: false, requirement: `Builder Hall ${builderResourceHall}` };
    const cost = mode === "auto" ? (row as { builderGoldElixirCostGoldPass: number }).builderGoldElixirCostGoldPass : row.builderGoldElixirCost;
    return { type, cost, capitalGold: row.capitalGoldObtained, available: true, requirement: null };
  }

  const row = mode === "auto" ? forge.autoForgeAtTownHall(townHall) : forge.forgeAtTownHall(townHall);
  const darkElixir = type === "darkElixir";
  const cost = !row
    ? undefined
    : mode === "auto"
      ? darkElixir
        ? (row as { darkElixirCostGoldPass?: number }).darkElixirCostGoldPass
        : (row as { goldElixirCostGoldPass: number }).goldElixirCostGoldPass
      : darkElixir
        ? row.darkElixirCost
        : row.goldElixirCost;
  if (!row || cost === undefined) {
    const requiredTownHall = darkElixir ? darkElixirTownHall : firstRateTownHall;
    return { type, cost: 0, capitalGold: 0, available: false, requirement: `Town Hall ${requiredTownHall}` };
  }
  return { type, cost, capitalGold: row.capitalGoldObtained, available: true, requirement: null };
};

/** Below the first Town Hall with a rate only the Builder Base resources have rows. */
export const forgeRates = (mode: ForgeMode, townHall: number, builderHall: number): ForgeRate[] =>
  forgeResources
    .filter(({ type }) => isBuilderResource(type) || townHall >= firstRateTownHall)
    .map(({ type }) => forgeRate(type, mode, townHall, builderHall));

export const dailyCapitalGold = (townHall: number): number => forge.dailyForgeAtTownHall(townHall)?.capitalGoldObtained ?? 0;

export const openSlotCount = (townHall: number): number => forge.availableForgesAtTownHall(townHall) ?? 0;

/** The Town Hall that opens a slot, counting from 1. */
export const slotTownHall = (slot: number): number | null =>
  forge.availableForges().find((row) => row.slots >= slot)?.townHallRequired ?? null;

/** Auto Forge needs the Gold Pass perk and the first Town Hall with a forge rate. */
export const autoForgeOpen = (village: Playthrough): boolean =>
  dailiesOf(village).goldPass.autoForgeUnlocked && village.data.homeVillage.townHallLevel >= firstRateTownHall;

const durationToMs = ({ days = 0, hours = 0, minutes = 0, seconds = 0 }: { days?: number; hours?: number; minutes?: number; seconds?: number }) =>
  (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;

/** The crafting time a run starts with, shortened by the Gold Pass builder boost. */
export const forgeDurationMs = (boost: BoostPercent): number =>
  durationToMs(boost === 0 ? forge.craftingTime() : calculators().boost().builderBoost(forge.craftingTime(), boost));

export const forgeBoost = (village: Playthrough, now: Date): BoostPercent => goldPassBoosts(village, now).builder;

/** Amounts under a million print in full, so 60,000 Dark Elixir does not read as 0.1M. */
export const formatResourceAmount = (amount: number): string => {
  if (amount < 1_000_000) return amount.toLocaleString("en-US");
  return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
};

export const forgeSlots = (village: Playthrough): ForgeSlotData[] => {
  const stored = dailiesOf(village).forgeSlots;
  return Array.from({ length: FORGE_SLOT_COUNT }, (_, index) => stored[index] ?? emptySlot);
};

export const emptySlot: ForgeSlotData = { resourceType: null, endsAt: null, durationMs: 0, capitalGoldOutput: 0, resourceCost: 0 };

export const slotState = (slot: ForgeSlotData, now: Date): SlotState => {
  if (!slot.endsAt) return "idle";
  return Date.parse(slot.endsAt) <= now.getTime() ? "done" : "running";
};

/** Auto Forge starts the next run when one ends, so the end of the current run is derived from the saved one. */
export const autoCycleEnd = (auto: AutoForgeData, now: Date): number | null => {
  if (!auto.endsAt) return null;
  const savedEnd = Date.parse(auto.endsAt);
  if (auto.durationMs <= 0 || savedEnd > now.getTime()) return savedEnd;
  const finishedRuns = Math.ceil((now.getTime() - savedEnd) / auto.durationMs);
  const end = savedEnd + finishedRuns * auto.durationMs;
  return end > now.getTime() ? end : end + auto.durationMs;
};

export const startSlot = (
  village: Playthrough,
  index: number,
  rate: ForgeRate,
  now: Date,
): Playthrough => {
  const dailies = dailiesOf(village);
  const durationMs = forgeDurationMs(forgeBoost(village, now));
  const slot: ForgeSlotData = {
    resourceType: rate.type,
    endsAt: new Date(now.getTime() + durationMs).toISOString(),
    durationMs,
    capitalGoldOutput: rate.capitalGold,
    resourceCost: rate.cost,
  };
  return withDailies(village, { ...dailies, forgeSlots: forgeSlots(village).map((saved, i) => (i === index ? slot : saved)) });
};

/** Stop and Reset clear the same fields, so the slot is idle again. */
export const clearSlot = (village: Playthrough, index: number): Playthrough =>
  withDailies(village, {
    ...dailiesOf(village),
    forgeSlots: forgeSlots(village).map((saved, i) => (i === index ? emptySlot : saved)),
  });

export const startAutoForge = (village: Playthrough, rate: ForgeRate, now: Date): Playthrough => {
  const durationMs = forgeDurationMs(forgeBoost(village, now));
  const autoForge: AutoForgeData = {
    endsAt: new Date(now.getTime() + durationMs).toISOString(),
    resourceType: rate.type,
    resourceAmount: rate.cost,
    capitalGoldOutput: rate.capitalGold,
    durationMs,
  };
  return withDailies(village, { ...dailiesOf(village), autoForge });
};

export const stopAutoForge = (village: Playthrough): Playthrough =>
  withDailies(village, {
    ...dailiesOf(village),
    autoForge: { endsAt: null, resourceType: "gold", resourceAmount: 0, capitalGoldOutput: 0, durationMs: 0 },
  });
