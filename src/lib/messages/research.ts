import { messages } from "@/i18n/text";

export const researchText = messages<{
  title: string;
  subline: (name: string, townHall: number) => string;
  tabsLabel: string;
  tabs: {
    troops: string;
    spells: string;
    siegeMachines: string;
  };
  strip: {
    title: string;
    noLanes: string;
    openQueue: string;
    unassignedHelp: string;
    levelLabel: string;
    level: (level: number, max: number) => string;
    notTracked: string;
    boostLabel: string;
  };
  card: {
    notUnlocked: string;
    markUnlocked: string;
    maxAtHall: (level: number) => string;
    progress: (name: string) => string;
  };
  empty: {
    title: string;
    none: string;
    allMax: string;
  };
  boostValue: (percent: number) => string;
}>("research", {
  fns: {
    subline: ["name", "townHall"],
    "strip.level": ["level", "max"],
    "card.maxAtHall": ["level"],
    "card.progress": ["name"],
    boostValue: ["percent"],
  },
  arrays: [],
});
