import { messages } from "@/i18n/text";

export const leagueDataText = messages<{
  stats: {
    attacksPerWeek: string;
    promoted: string;
    demoted: string;
    trophyRange: string;
    starsForBonus: string;
  };
  sections: {
    maxLoot: string;
    leagueBonus: string;
    weeklyStarBonus: string;
    starBonusReward: string;
  };
  range: (min: string, max: string) => string;
  rangeOpen: (min: string) => string;
}>("leagueData", {
  fns: { range: ["min", "max"], rangeOpen: ["min"] },
  arrays: [],
});
