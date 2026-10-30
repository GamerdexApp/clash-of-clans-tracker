import { achievements as achievementData } from "clash-of-clans-data";

import {
  getNextStarRewards,
  mergeWithPackageList,
  type NextStarRewards,
} from "@/lib/utils/achievementHelpers";
import type { Playthrough } from "@/types/app";
import type { TrackedAchievement } from "@/types/app/game";

export type AchievementVillage = "home" | "builderBase" | "clanCapital";

export const achievementVillages: AchievementVillage[] = ["home", "builderBase", "clanCapital"];

export const MAX_STARS = 3;

const catalog = achievementData();

type Tier = { tier: number; requirement: number | string };

const tiersOf = (name: string): Tier[] => (catalog.findByName(name)?.tiers ?? []) as unknown as Tier[];

const nextTier = (name: string, stars: number): Tier | undefined => {
  const tiers = tiersOf(name);
  return tiers[Math.min(stars, tiers.length - 1)];
};

/** A few achievements name a building as the requirement. Their target counts the tier instead. */
const numericTarget = (tier: Tier): number => (typeof tier.requirement === "number" ? tier.requirement : tier.tier);

/** Every achievement of the game with the saved progress of the village. */
export const achievementList = (village: Playthrough): TrackedAchievement[] =>
  mergeWithPackageList(village.data.achievements).map((entry) => {
    const tier = nextTier(entry.name, entry.stars);
    if (!tier) return entry;
    const named = typeof tier.requirement === "string";
    return {
      ...entry,
      target: typeof entry.target === "number" && Number.isFinite(entry.target) ? entry.target : numericTarget(tier),
      info: named && entry.stars < MAX_STARS ? `${entry.info ?? ""} (next: ${tier.requirement})` : entry.info,
    };
  });

export const achievementsOf = (list: TrackedAchievement[], area: AchievementVillage) => list.filter((entry) => entry.village === area);

export interface StarProgress {
  stars: number;
  maxStars: number;
  /** A whole percent, rounded down so 100 means every star. */
  percent: number;
}

export const starProgress = (list: TrackedAchievement[]): StarProgress => {
  const maxStars = list.length * MAX_STARS;
  const stars = list.reduce((sum, entry) => sum + Math.min(entry.stars, MAX_STARS), 0);
  return { stars, maxStars, percent: maxStars === 0 ? 0 : Math.floor((stars / maxStars) * 100) };
};

export const areaProgress = (list: TrackedAchievement[], area: AchievementVillage): StarProgress =>
  starProgress(achievementsOf(list, area));

export const nextStarRewards = (entry: TrackedAchievement): NextStarRewards | null => getNextStarRewards(entry);

/** The requirement of the star an achievement earns next. A full achievement keeps its last requirement. */
export const targetForStars = (name: string, stars: number): number | null => {
  const tier = nextTier(name, stars);
  return tier ? numericTarget(tier) : null;
};

export interface AchievementEdit {
  stars?: number;
  value?: number;
  target?: number;
  manual?: boolean;
}

const whole = (value: number) => Math.max(0, Math.floor(value));

/**
 * Changes one achievement. Any edit ticks Manual, so the next refresh from the game does not
 * overwrite it. A change of stars moves the target to the requirement of the next star.
 */
export const editAchievement = (village: Playthrough, name: string, area: AchievementVillage, edit: AchievementEdit): Playthrough => {
  const current = achievementList(village).find((entry) => entry.name === name && entry.village === area);
  if (!current) return village;

  const stars = edit.stars === undefined ? current.stars : Math.min(MAX_STARS, whole(edit.stars));
  const movedTarget = edit.stars !== undefined && stars !== current.stars ? targetForStars(name, stars) : null;
  const next: TrackedAchievement = {
    ...current,
    stars,
    value: edit.value === undefined ? current.value : whole(edit.value),
    target: edit.target !== undefined ? whole(edit.target) : (movedTarget ?? current.target),
    isManual: edit.manual ?? true,
  };

  const saved = village.data.achievements;
  const exists = saved.some((entry) => entry.name === name && entry.village === area);
  const achievements = exists
    ? saved.map((entry) => (entry.name === name && entry.village === area ? next : entry))
    : [...saved, next];
  return { ...village, data: { ...village.data, achievements } };
};

export interface RewardTotals {
  earned: number;
  total: number;
}

/** Gems and XP the first three stars of the achievements give, and how much of it the saved stars already earned. */
export const rewardTotals = (list: TrackedAchievement[]): { gems: RewardTotals; xp: RewardTotals } => {
  const totals = { gems: { earned: 0, total: 0 }, xp: { earned: 0, total: 0 } };
  for (const entry of list) {
    const tiers = catalog.findByName(entry.name)?.tiers.slice(0, MAX_STARS) ?? [];
    tiers.forEach((reward, index) => {
      totals.gems.total += reward.gemsRewarded;
      totals.xp.total += reward.xpRewarded;
      if (index < Math.min(entry.stars, MAX_STARS)) {
        totals.gems.earned += reward.gemsRewarded;
        totals.xp.earned += reward.xpRewarded;
      }
    });
  }
  return totals;
};
