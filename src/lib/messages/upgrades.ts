export const upgradeText = {
  massEdit: {
    hint: "Levels can also be set in Mass edit.",
    link: "Open Mass edit",
  },
  hideMax: "Hide Max",
  strip: {
    free: (free: number, total: number) => `${free} of ${total} free`,
    idle: "Free",
    unassigned: "Unassigned",
    taskLevels: (from: number, to: number) => `Lv ${from} to ${to}`,
  },
  start: {
    title: "Start upgrade",
    levelChange: (from: number, to: number) => (from === 0 ? `Build to Lv ${to}` : `Lv ${from} to ${to}`),
    time: "Time",
    cost: "Cost",
    doneAt: "Done at",
    wasBoosted: (base: string, percent: number) => `was ${base}, Gold Pass -${percent}%`,
    wasCost: (base: string, resource: string) => `${resource}, was ${base}`,
    resource: (resource: string) => resource,
    storedNote: "this boosted time is stored",
    instant: "This build takes no time. It finishes at once and uses no builder.",
    lanes: {
      builder: {
        label: "Builder",
        choose: "Choose a builder to start.",
        noneFree: "Every builder is busy. Cancel or finish an upgrade first.",
      },
      research: {
        label: "Research lane",
        choose: "Choose a lane to start.",
        noneFree: "Every research lane is busy. Cancel or finish a research first.",
      },
      pet: {
        label: "Pet House",
        choose: "Choose the Pet House to start.",
        noneFree: "The Pet House is busy. Cancel or finish the pet upgrade first.",
      },
    },
    requires: {
      laboratory: (level: number) => `Requires Laboratory ${level}`,
      "pet-house": (level: number) => `Requires Pet House ${level}`,
      noPetHouse: "Build a Pet House first",
    },
    free: "Free",
    cancel: "Cancel",
    confirm: "Start upgrade",
    confirmInstant: "Build now",
  },
  finish: {
    title: "Finish early",
    left: "left",
    methodLabel: "How did it finish?",
    methods: {
      timePassed: {
        label: "Time Passed",
        description: "The timer already ran out in the game. Nothing is spent.",
      },
      gems: {
        label: "Gems",
        description: "Pay gems in the game to complete it now. The cost falls as time runs down.",
      },
      book: { label: "Book of Building", description: "Instantly completes a running building upgrade." },
      hammer: { label: "Hammer of Building", description: "Instantly upgrades a building to its next level." },
    },
    stores: "What the village stores",
    storesLevel: (level: number) => `Level ${level}. The timer is cleared.`,
    storesSaved: (time: string) => `${time} is added to time saved.`,
    storesSavedNone: "Time saved stays as it was.",
    gemFigure: (gems: number) => `About ${gems} gems (game data rule, in game cost may differ).`,
    notTracked: {
      timePassed: "",
      gems: "Gems spent are not tracked.",
      book: "Books owned are not tracked.",
      hammer: "Hammers owned are not tracked.",
    },
    keep: "Keep upgrading",
    confirm: "Finish upgrade",
  },
  cancel: {
    title: "Cancel this upgrade?",
    body: (name: string, level: number, builder: string) =>
      `Cancelling stops the timer. ${name} stays at Lv ${level} and ${builder} is free again.`,
    refundTitle: "Refund in the game: 50%",
    refundBody: (refund: string, paid: string, resource: string) =>
      `Cancelling in Clash of Clans gives back ${refund} ${resource} of the ${paid} you paid. This app does not track your resources, so check your storages after you cancel.`,
    undoNote: "You can undo for 10 seconds after cancelling. After that, start the upgrade again.",
    keep: "Keep upgrading",
    confirm: "Cancel upgrade",
  },
} as const;
