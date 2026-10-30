import { dailiesOf, withDailies } from "./dailies";
import type { Playthrough } from "@/types/app";
import type { BoostPercent, LaneKind } from "@/types/app/engine";

export const monthKeyFor = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/** A boost chosen in an earlier month reads as 0. Nothing is written until the player changes it. */
export const goldPassBoosts = (village: Playthrough, now: Date): { builder: BoostPercent; research: BoostPercent } => {
  const goldPass = village.dailies?.goldPass;
  if (!goldPass || goldPass.monthKey !== monthKeyFor(now)) return { builder: 0, research: 0 };
  return { builder: goldPass.builderBoostPct, research: goldPass.researchBoostPct };
};

/** The Gold Pass boost for a lane. The Builder Base lanes have none. */
export const boostForLane = (lane: LaneKind, village: Playthrough, now: Date): BoostPercent => {
  const boosts = goldPassBoosts(village, now);
  if (lane === "builder") return boosts.builder;
  return lane === "bbBuilder" || lane === "bbResearch" ? 0 : boosts.research;
};

export type GoldPassPerk = "hoggyBankUnlocked" | "gemDonationsUnlocked" | "autoForgeUnlocked" | "requestTimeReductionUnlocked";

const SEASON_PASS_TOWN_HALL = 7;

export const seasonPassOpen = (village: Playthrough): boolean => village.data.homeVillage.townHallLevel >= SEASON_PASS_TOWN_HALL;

/** A boost change writes the month key too, so the next visit does not read the boost as last month's. */
export const setBoost = (village: Playthrough, kind: "builder" | "research", boost: BoostPercent, now: Date): Playthrough => {
  const dailies = dailiesOf(village);
  const kept = goldPassBoosts(village, now);
  return withDailies(village, {
    ...dailies,
    goldPass: {
      ...dailies.goldPass,
      builderBoostPct: kind === "builder" ? boost : kept.builder,
      researchBoostPct: kind === "research" ? boost : kept.research,
      monthKey: monthKeyFor(now),
    },
  });
};

export const setPerk = (village: Playthrough, perk: GoldPassPerk, on: boolean): Playthrough => {
  const dailies = dailiesOf(village);
  return withDailies(village, { ...dailies, goldPass: { ...dailies.goldPass, [perk]: on } });
};

export const setProspectorUnlocked = (village: Playthrough, unlocked: boolean): Playthrough => {
  const dailies = dailiesOf(village);
  return withDailies(village, { ...dailies, helpers: { ...dailies.helpers, prospectorUnlocked: unlocked } });
};

export interface BoostRollover {
  builder: BoostPercent;
  research: BoostPercent;
}

/** The boosts a player chose in an earlier month, while this month still has none written. */
export const rolledBoosts = (village: Playthrough, now: Date): BoostRollover | null => {
  const { goldPass } = dailiesOf(village);
  const isEarlierMonth = goldPass.monthKey !== "" && goldPass.monthKey !== monthKeyFor(now);
  const hadBoost = goldPass.builderBoostPct > 0 || goldPass.researchBoostPct > 0;
  return isEarlierMonth && hadBoost ? { builder: goldPass.builderBoostPct, research: goldPass.researchBoostPct } : null;
};

/** Accepts the reset by writing this month with no boost, so the notice goes away. */
export const acceptRollover = (village: Playthrough, now: Date): Playthrough => {
  const dailies = dailiesOf(village);
  return withDailies(village, { ...dailies, goldPass: { ...dailies.goldPass, builderBoostPct: 0, researchBoostPct: 0, monthKey: monthKeyFor(now) } });
};

/** Brings the boosts of last month back into this month. */
export const restoreRolledBoosts = (village: Playthrough, now: Date): Playthrough => {
  const rolled = rolledBoosts(village, now);
  if (!rolled) return village;
  const dailies = dailiesOf(village);
  return withDailies(village, {
    ...dailies,
    goldPass: { ...dailies.goldPass, builderBoostPct: rolled.builder, researchBoostPct: rolled.research, monthKey: monthKeyFor(now) },
  });
};

export const monthResetDate = (now: Date): Date => new Date(now.getFullYear(), now.getMonth() + 1, 1);
