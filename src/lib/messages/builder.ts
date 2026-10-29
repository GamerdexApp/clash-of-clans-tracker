export const builderText = {
  title: "Builder",
  subline: (name: string, townHall: number) => `${name}, Town Hall ${townHall}`,
  tabsLabel: "Builder sections",
  tabs: {
    defenses: "Defenses",
    army: "Army",
    resources: "Resources",
    crafted: "Crafted Defenses",
    traps: "Traps",
    heroes: "Heroes",
    guardians: "Guardians",
    townHall: "Town Hall",
  },
  builders: {
    title: "Builders",
    boostLabel: "Gold Pass builder boost",
    boostValue: (percent: number) => (percent > 0 ? `-${percent}% time and cost` : "None"),
    openQueue: "Open queue and timeline",
    unassignedHelp:
      "Some upgrades are saved on a builder that is not built, or on a builder another upgrade already uses. Finish or cancel them.",
    noBuilders:
      "This village has no builders yet. Build the first Builder's Hut from the Defenses tab. It is free and instant.",
  },
  gate: {
    requires: (townHall: number) => `Requires Town Hall ${townHall}`,
    where: (townHall: number, required: number) =>
      `This village is at Town Hall ${townHall}. Reach Town Hall ${required} to unlock this tab.`,
    fix: "Go to the Town Hall tab",
  },
  empty: {
    title: "Nothing here yet",
    description: "No buildings of this kind are available at this Town Hall level.",
    allMax: "Every building here is at its maximum. Turn off Hide Max to see them.",
  },
  card: {
    maxAtHall: (level: number) => `Max Lv ${level} at this Town Hall`,
    progress: (name: string) => `${name} progress`,
    notBuilt: "Not built",
    level: (level: number, max: number) => `Lv ${level} of ${max}`,
    build: "Build",
    upgradeTo: (level: number) => `Upgrade to Lv ${level}`,
    superchargeTo: (tier: number) => `Supercharge to tier ${tier}`,
    maxed: "Max",
    running: (to: number) => `Upgrading to Lv ${to}`,
    finish: "Finish",
    cancel: "Cancel",
    showAll: (count: number) => `Show all ${count}`,
    showFewer: "Show fewer",
    instance: (number: number) => `#${number}`,
    supercharge: (tier: number, tiers: number) => `Supercharge ${tier} of ${tiers}`,
  },
} as const;
