export const builderBaseText = {
  upgrades: {
    title: "Upgrades",
    subline: (name: string, hall: number) => `${name}, Builder Hall ${hall}`,
    sublineNotSet: (name: string) => `${name}, Builder Hall not set`,
    tabsLabel: "Builder Base sections",
    tabs: {
      defenses: "Defenses",
      army: "Army",
      resources: "Resources",
      traps: "Traps",
      heroes: "Heroes",
      other: "Other",
    },
    strip: {
      title: "Builders",
      noBuilders: "The Builder Base has two builders.",
      unassignedHelp: "Some upgrades are saved on a builder that another upgrade already uses. Finish or cancel them.",
    },
  },
  locked: {
    title: "Requires Town Hall 6",
    description: (townHall: number) =>
      `This village is at Town Hall ${townHall}. The Builder Base unlocks at Town Hall 6, or when you set a Builder Hall level.`,
  },
  notSet: {
    action: "Set Builder Hall level",
    troopsDescription: "The Builder Base troops follow the Builder Hall level. Set it on the Upgrades page, Other tab.",
    title: "Pick your Builder Hall level to start tracking",
    description: "Set the Builder Hall level in the tile below. The Builder Base lists follow it.",
  },
  hall: {
    title: "Builder Hall",
    notSet: "Not set",
    option: (level: number) => `Builder Hall ${level}`,
    since: (days: number, level: number) => `${days} ${days === 1 ? "day" : "days"} at Builder Hall ${level}`,
    confirm: {
      title: (level: number) => `Change Builder Hall to ${level}?`,
      raising: "Raising the level shows more buildings and higher caps. Nothing you saved is removed.",
      lowering: "Lowering the level hides buildings and caps above it. Your saved levels are kept.",
      clearing: "Clearing the level hides every Builder Base list. Your saved levels are kept.",
      setDays: "Set Days at Builder Hall to today",
      cancel: "Cancel",
      confirm: "Change level",
    },
    toast: (from: number, to: number) => `Builder Hall ${from === 0 ? "not set" : from} to ${to === 0 ? "not set" : to}`,
    undo: "Undo",
  },
  other: {
    clockTower: "Clock Tower",
    clockTowerMax: (level: number) => `Max Lv ${level} at this Builder Hall`,
    clockTowerProgress: "Clock Tower progress",
  },
  empty: {
    title: "Nothing here yet",
    description: "No buildings of this kind are available at this Builder Hall level.",
    allMax: "Everything here is at its maximum. Turn off Hide Max to see it.",
  },
  heroes: {
    maxAtHall: (level: number) => `Max Lv ${level} at this Builder Hall`,
    progress: (name: string) => `${name} progress`,
  },
} as const;

export const builderBaseTroopsText = {
  title: "Troops",
  subline: (name: string, hall: number) => `${name}, Builder Hall ${hall}`,
  sublineNotSet: (name: string) => `${name}, Builder Hall not set`,
  strip: {
    title: "Star Laboratory",
    noLanes: "The Star Laboratory is not available.",
    unassignedHelp: "More than one troop research is saved on the Star Laboratory. Finish or cancel the extra one.",
    levelLabel: "Star Laboratory level",
    level: (level: number, max: number) => `${level} of ${max}`,
    notSet: "Not set",
  },
  card: {
    notUnlocked: "Not unlocked",
    markUnlocked: "Mark as unlocked",
    maxAtHall: (level: number) => `Max Lv ${level} at this Builder Hall`,
    unlockedBy: (barracks: number) => `Unlocked by Builder Barracks level ${barracks}`,
    progress: (name: string) => `${name} progress`,
  },
  unavailable: {
    title: "Not available at this Builder Hall",
    requires: (barracks: number, hall: number) => `Requires Builder Barracks ${barracks}, which needs Builder Hall ${hall}`,
  },
  empty: {
    title: "Nothing here yet",
    allMax: "Every troop is at its maximum. Turn off Hide Max to see them.",
  },
} as const;

export const builderBaseProfileText = {
  title: "Builder Base profile",
  trophies: "Trophies",
  bestTrophies: "Best trophies",
  bestHint: "Never below your trophies.",
  league: "League",
  leagueNone: "Not set",
  matchTrophies: "Match trophies",
  since: "At this Builder Hall since",
  sinceToday: "Set to today",
} as const;
