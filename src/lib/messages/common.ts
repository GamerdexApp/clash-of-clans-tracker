import { messages } from "@/i18n/text";

export const commonText = messages<{
  gate: {
    title: string;
    description: string;
    newVillage: string;
    chooseVillage: string;
  };
  townHallTab: {
    title: string;
    supercharge: string;
    superchargeDone: (current: number, max: number) => string;
    superchargeProgress: string;
  };
  heroesUnlock: string;
  progressLabel: (name: string) => string;
  countdownLabel: (name: string) => string;
  capitalGold: string;
  queue: {
    conflict: string;
    level: (level: number) => string;
    levelSupercharge: (level: number) => string;
    now: string;
    itemTitle: (name: string, level: number) => string;
  };
  finishDescription: (
    name: string,
    from: number,
    to: number,
    method: string,
    time: string,
    unit: string,
  ) => string;
  lookupError: {
    rateLimit: (seconds: number) => string;
    notFound: (tag: string) => string;
    api: (status: number) => string;
    network: string;
  };
}>("common", {
  fns: {
    "townHallTab.superchargeDone": ["current", "max"],
    progressLabel: ["name"],
    countdownLabel: ["name"],
    "queue.level": ["level"],
    "queue.levelSupercharge": ["level"],
    "queue.itemTitle": ["name", "level"],
    finishDescription: ["name", "from", "to", "method", "time", "unit"],
    "lookupError.rateLimit": ["seconds"],
    "lookupError.notFound": ["tag"],
    "lookupError.api": ["status"],
  },
  arrays: [],
});
