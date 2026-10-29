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
