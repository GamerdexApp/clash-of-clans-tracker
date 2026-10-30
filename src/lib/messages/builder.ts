import { messages } from "@/i18n/text";

export const builderText = messages<{
  title: string;
  subline: (name: string, townHall: number) => string;
  tabsLabel: string;
  tabs: {
    defenses: string;
    army: string;
    resources: string;
    crafted: string;
    traps: string;
    heroes: string;
    guardians: string;
    townHall: string;
  };
  builders: {
    title: string;
    boostLabel: string;
    boostValue: (percent: number) => string;
    openQueue: string;
    unassignedHelp: string;
    noBuilders: string;
  };
  gate: {
    requires: (townHall: number) => string;
    where: (townHall: number, required: number) => string;
    fix: string;
  };
  empty: {
    title: string;
    description: string;
    allMax: string;
  };
  card: {
    maxAtHall: (level: number) => string;
    maxAtBuilderHall: (level: number) => string;
    progress: (name: string) => string;
    notBuilt: string;
    level: (level: number, max: number) => string;
    build: string;
    upgradeTo: (level: number) => string;
    superchargeTo: (tier: number) => string;
    maxed: string;
    running: (to: number) => string;
    finish: string;
    cancel: string;
    showAll: (count: number) => string;
    showFewer: string;
    instance: (number: number) => string;
    supercharge: (tier: number, tiers: number) => string;
  };
}>("builder", {
  fns: {
    subline: ["name", "townHall"],
    "builders.boostValue": ["percent"],
    "gate.requires": ["townHall"],
    "gate.where": ["townHall", "required"],
    "card.maxAtHall": ["level"],
    "card.maxAtBuilderHall": ["level"],
    "card.progress": ["name"],
    "card.level": ["level", "max"],
    "card.upgradeTo": ["level"],
    "card.superchargeTo": ["tier"],
    "card.running": ["to"],
    "card.showAll": ["count"],
    "card.instance": ["number"],
    "card.supercharge": ["tier", "tiers"],
  },
  arrays: [],
});
