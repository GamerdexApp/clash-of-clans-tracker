import { messages } from "@/i18n/text";

export const petsText = messages<{
  title: string;
  subline: (name: string, townHall: number) => string;
  strip: {
    title: string;
    openQueue: string;
    noPetHouse: string;
    unassignedHelp: string;
    levelLabel: string;
    level: (level: number, max: number) => string;
    notBuilt: string;
    boostLabel: string;
  };
  boostValue: (percent: number) => string;
  locked: {
    title: string;
    body: (townHall: number) => string;
    needs: (townHall: number, petHouse: number) => string;
  };
  card: {
    notUnlocked: string;
    markUnlocked: string;
    maxAtHall: (level: number) => string;
    progress: (name: string) => string;
  };
  empty: {
    title: string;
    allMax: string;
  };
}>("pets", {
  fns: {
    subline: ["name", "townHall"],
    "strip.level": ["level", "max"],
    boostValue: ["percent"],
    "locked.body": ["townHall"],
    "locked.needs": ["townHall", "petHouse"],
    "card.maxAtHall": ["level"],
    "card.progress": ["name"],
  },
  arrays: [],
});
