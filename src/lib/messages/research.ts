export const researchText = {
  title: "Research",
  subline: (name: string, townHall: number) => `${name}, Town Hall ${townHall}`,
  tabsLabel: "Research sections",
  tabs: { troops: "Troops", spells: "Spells", siegeMachines: "Siege" },
  strip: {
    title: "Laboratory",
    noLanes: "No research lane is available.",
    openQueue: "Open queue and timeline",
    unassignedHelp: "Some research is saved on a lane that is off, or on a lane another research already uses. Finish or cancel it.",
    levelLabel: "Laboratory level",
    level: (level: number, max: number) => `${level} of ${max}`,
    notTracked: "Not set",
    boostLabel: "Gold Pass research boost",
  },
  card: {
    notUnlocked: "Not unlocked",
    markUnlocked: "Mark as unlocked",
    maxAtHall: (level: number) => `Max Lv ${level} at this Town Hall`,
    progress: (name: string) => `${name} progress`,
  },
  empty: {
    title: "Nothing here yet",
    none: "Nothing in this section is available at this Town Hall level.",
    allMax: "Everything here is at its maximum. Turn off Hide Max to see it.",
  },
  boostValue: (percent: number) => (percent > 0 ? `-${percent}% time and cost` : "None"),
} as const;
