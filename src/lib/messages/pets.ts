export const petsText = {
  title: "Pets",
  subline: (name: string, townHall: number) => `${name}, Town Hall ${townHall}`,
  strip: {
    title: "Pet House",
    noPetHouse: "Build a Pet House first. Set its level on the Builder page, Army tab.",
    unassignedHelp: "This pet upgrade runs on a lane that no longer exists. Finish or cancel it.",
    levelLabel: "Pet House level",
    level: (level: number, max: number) => `${level} of ${max}`,
    notBuilt: "Not built",
    boostLabel: "Gold Pass research boost",
  },
  boostValue: (percent: number) => (percent > 0 ? `-${percent}% time and cost` : "None"),
  locked: {
    title: "Pets unlock at Town Hall 14",
    body: (townHall: number) => `This village is at Town Hall ${townHall}. These are the pets you will get.`,
    needs: (townHall: number, petHouse: number) => `Town Hall ${townHall}, Pet House ${petHouse}`,
  },
  card: {
    notUnlocked: "Not unlocked",
    markUnlocked: "Mark as unlocked",
    maxAtHall: (level: number) => `Max Lv ${level}`,
    progress: (name: string) => `${name} progress`,
  },
  empty: {
    title: "Nothing here yet",
    allMax: "Every pet is at its maximum. Turn off Hide Max to see them.",
  },
} as const;
