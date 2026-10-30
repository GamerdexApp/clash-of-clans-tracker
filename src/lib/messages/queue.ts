import { messages } from "@/i18n/text";

export const queueText = messages<{
  goldPass: (percent: number) => string;
  options: {
    open: string;
    title: string;
    description: string;
    done: string;
  };
  totals: {
    freeValue: (free: number, total: number) => string;
    queued: string;
    time: string;
    allDone: string;
    none: string;
    cost: string;
    noCost: string;
  };
  lane: {
    idle: string;
    queueEmpty: string;
    startNow: string;
    remove: string;
    moveUp: string;
    moveDown: string;
    moveToLane: string;
    levels: (from: number, to: number) => string;
    removed: (name: string) => string;
    started: (name: string) => string;
    undo: string;
  };
  timeline: {
    title: string;
    zoomLabel: string;
    zooms: {
      "3": string;
      "7": string;
      "14": string;
      "30": string;
      "90": string;
    };
    conflictsTitle: string;
    noConflicts: string;
    laneLabel: (label: string) => string;
    now: string;
    idle: string;
  };
  add: {
    search: string;
    hiddenFromAll: (names: string) => string;
    chooseCategories: string;
    chooseCategoriesHelp: string;
    add: string;
    addUpToHere: string;
    showMore: string;
    showMoreUpgrades: string;
    nothing: string;
    nothingDescription: string;
    added: (count: number, name: string) => string;
    close: string;
    unlockTitle: string;
    unlockHelp: string;
    markUnlocked: string;
    showAllLocked: (count: number) => string;
    showFewerLocked: string;
    allLabel: string;
  };
  lanes: {
    builder: {
      title: string;
      subline: (name: string) => string;
      back: string;
      free: string;
      laneBusy: string;
      goblin: {
        label: string;
        help: string;
      };
      gate: string;
      add: {
        title: string;
        description: string;
        lane: string;
        search: string;
      };
      categories: {
        defenses: string;
        armyBuildings: string;
        resourceBuildings: string;
        traps: string;
        heroes: string;
        townHall: string;
        craftedDefenses: string;
        guardians: string;
        supercharges: string;
      };
    };
    research: {
      title: string;
      subline: (name: string) => string;
      back: string;
      free: string;
      laneBusy: string;
      goblin: {
        label: string;
        help: string;
      };
      gate: string;
      add: {
        title: string;
        description: string;
        lane: string;
        search: string;
      };
      categories: {
        troops: string;
        spells: string;
        siegeMachines: string;
      };
    };
    pet: {
      title: string;
      subline: (name: string) => string;
      back: string;
      free: string;
      laneBusy: string;
      gate: string;
      add: {
        title: string;
        description: string;
        lane: string;
        search: string;
      };
      categories: {
        pets: string;
      };
    };
    bbBuilder: {
      title: string;
      subline: (name: string, hall: number) => string;
      back: string;
      free: string;
      laneBusy: string;
      gate: string;
      add: {
        title: string;
        description: string;
        lane: string;
        search: string;
      };
      categories: {
        defenses: string;
        armyBuildings: string;
        resourceBuildings: string;
        traps: string;
        heroes: string;
        other: string;
      };
    };
    bbResearch: {
      title: string;
      subline: (name: string, hall: number) => string;
      back: string;
      free: string;
      laneBusy: string;
      gate: string;
      add: {
        title: string;
        description: string;
        lane: string;
        search: string;
      };
      categories: {
        troops: string;
      };
    };
  };
}>("queue", {
  fns: {
    goldPass: ["percent"],
    "totals.freeValue": ["free", "total"],
    "lane.levels": ["from", "to"],
    "lane.removed": ["name"],
    "lane.started": ["name"],
    "timeline.laneLabel": ["label"],
    "add.hiddenFromAll": ["names"],
    "add.added": ["count:plural", "name"],
    "add.showAllLocked": ["count"],
    "lanes.builder.subline": ["name"],
    "lanes.research.subline": ["name"],
    "lanes.pet.subline": ["name"],
    "lanes.bbBuilder.subline": ["name", "hall"],
    "lanes.bbResearch.subline": ["name", "hall"],
  },
  arrays: [],
});
