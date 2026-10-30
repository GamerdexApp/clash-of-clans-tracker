import { messages } from "@/i18n/text";

export const builderBaseText = messages<{
  upgrades: {
    title: string;
    subline: (name: string, hall: number) => string;
    sublineNotSet: (name: string) => string;
    tabsLabel: string;
    tabs: {
      defenses: string;
      army: string;
      resources: string;
      traps: string;
      heroes: string;
      other: string;
    };
    strip: {
      title: string;
      noBuilders: string;
      openQueue: string;
      unassignedHelp: string;
    };
  };
  locked: {
    title: string;
    description: (townHall: number) => string;
  };
  notSet: {
    action: string;
    troopsDescription: string;
    title: string;
    description: string;
  };
  hall: {
    title: string;
    notSet: string;
    option: (level: number) => string;
    since: (days: number, level: number) => string;
    confirm: {
      title: (level: number) => string;
      raising: string;
      lowering: string;
      clearing: string;
      setDays: string;
      cancel: string;
      confirm: string;
    };
    toast: (from: number, to: number) => string;
    undo: string;
  };
  other: {
    clockTower: string;
    clockTowerMax: (level: number) => string;
    clockTowerProgress: string;
  };
  empty: {
    title: string;
    description: string;
    allMax: string;
  };
  heroes: {
    maxAtHall: (level: number) => string;
    progress: (name: string) => string;
  };
}>("builderBase", {
  fns: {
    "upgrades.subline": ["name", "hall"],
    "upgrades.sublineNotSet": ["name"],
    "locked.description": ["townHall"],
    "hall.option": ["level"],
    "hall.since": ["days:plural", "level"],
    "hall.confirm.title": ["level"],
    "hall.toast": ["from", "to"],
    "other.clockTowerMax": ["level"],
    "heroes.maxAtHall": ["level"],
    "heroes.progress": ["name"],
  },
  arrays: [],
});

export const builderBaseTroopsText = messages<{
  title: string;
  subline: (name: string, hall: number) => string;
  sublineNotSet: (name: string) => string;
  strip: {
    title: string;
    noLanes: string;
    openQueue: string;
    unassignedHelp: string;
    levelLabel: string;
    level: (level: number, max: number) => string;
    notSet: string;
  };
  card: {
    notUnlocked: string;
    markUnlocked: string;
    maxAtHall: (level: number) => string;
    unlockedBy: (barracks: number) => string;
    progress: (name: string) => string;
  };
  unavailable: {
    title: string;
    requires: (barracks: number, hall: number) => string;
  };
  empty: {
    title: string;
    allMax: string;
  };
}>("builderBaseTroops", {
  fns: {
    subline: ["name", "hall"],
    sublineNotSet: ["name"],
    "strip.level": ["level", "max"],
    "card.maxAtHall": ["level"],
    "card.unlockedBy": ["barracks"],
    "card.progress": ["name"],
    "unavailable.requires": ["barracks", "hall"],
  },
  arrays: [],
});

export const builderBaseProfileText = messages<{
  title: string;
  trophies: string;
  bestTrophies: string;
  bestHint: string;
  league: string;
  leagueNone: string;
  matchTrophies: string;
  since: string;
  sinceToday: string;
}>("builderBaseProfile", {
  fns: {},
  arrays: [],
});
