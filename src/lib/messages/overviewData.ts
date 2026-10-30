import { messages } from "@/i18n/text";

export const overviewDataText = messages<{
  stats: {
    level: string;
    warStars: string;
    trophies: string;
    bestTrophies: string;
    donations: string;
    received: string;
    war: string;
    attacks: string;
    defenses: string;
    builderTrophies: string;
    bestBuilderTrophies: string;
    contributions: string;
    warIn: string;
    warOut: string;
  };
  cards: {
    structures: string;
    traps: string;
    supercharge: string;
    crafted: string;
    lab: string;
    heroes: string;
    equipment: string;
    pets: string;
    walls: string;
    districts: string;
    troops: string;
    spells: string;
  };
  subs: {
    structures: string;
    lab: string;
    builderLab: string;
    walls: (total: number, max: number) => string;
    districts: (active: number, total: number) => string;
    available: (count: number) => string;
  };
}>("overviewData", {
  fns: {
    "subs.walls": ["total", "max"],
    "subs.districts": ["active", "total"],
    "subs.available": ["count"],
  },
  arrays: [],
});
