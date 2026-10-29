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
