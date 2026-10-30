import { messages } from "@/i18n/text";

export const villagesText = messages<{
  title: string;
  subline: (count: number) => string;
  sublineActive: (count: number, name: string) => string;
  newVillage: string;
  empty: {
    title: string;
    deletedTitle: string;
    description: string;
    restore: string;
  };
  filters: {
    search: string;
    sortLabel: string;
    sort: {
      lastModified: string;
      createdAt: string;
      name: string;
    };
    showing: (shown: number, total: number) => string;
    clear: string;
  };
  noMatch: {
    title: (query: string) => string;
    description: string;
  };
  card: {
    active: string;
    openOverview: string;
    setActive: string;
    edit: string;
    delete: string;
    halls: (townHall: number, builderHall: number) => string;
    daysAtTownHall: string;
    daysAtBuilderHall: string;
    notSet: string;
    clanCapital: string;
    clanCapitalStates: {
      on: string;
      off: string;
      locked: string;
    };
    created: (date: string) => string;
    lastModified: (date: string) => string;
    switched: (name: string) => string;
  };
  fields: {
    name: string;
    namePlaceholder: string;
    nameRequired: string;
    description: string;
    descriptionPlaceholder: string;
    townHallLevel: string;
    builderHallLevel: string;
    builderHallHelp: string;
    townHallUpgraded: string;
    builderHallUpgraded: string;
    level: (level: number) => string;
    trackCapital: string;
    trackCapitalHelp: string;
    trackCapitalLocked: string;
    cancel: string;
  };
  create: {
    title: string;
    submit: string;
    modeLabel: string;
    modes: {
      fresh: string;
      import: string;
    };
    modeNotes: {
      fresh: string;
      import: string;
    };
    makeActive: string;
    done: (name: string) => string;
    importNeedsLookup: string;
  };
  lookup: {
    step1: string;
    step2: string;
    tagLabel: string;
    tagPlaceholder: string;
    fetch: string;
    refresh: string;
    wait: (seconds: number) => string;
    serverNote: string;
    unavailable: string;
    found: (
      name: string,
      townHall: number,
      builderHall: number,
      achievements: number,
      troops: number,
    ) => string;
    buildingHelp: string;
    buildingLabel: string;
    buildingLoaded: (name: string) => string;
    buildingInvalid: string;
    buildingNotJson: string;
  };
  edit: {
    title: string;
    submit: string;
    refreshTitle: string;
    updatedTitle: string;
    untouchedTitle: string;
    dateSet: string;
    done: (name: string) => string;
  };
  delete: {
    title: string;
    description: string;
    question: (name: string) => string;
    activeNext: (next: string) => string;
    activeLast: string;
    exportFirst: string;
    cancel: string;
    confirm: string;
    done: (name: string) => string;
    doneMessage: string;
    undo: string;
  };
}>("villages", {
  fns: {
    subline: ["count:plural"],
    sublineActive: ["count:plural", "name"],
    "filters.showing": ["shown", "total"],
    "noMatch.title": ["query"],
    "card.halls": ["townHall", "builderHall"],
    "card.created": ["date"],
    "card.lastModified": ["date"],
    "card.switched": ["name"],
    "fields.level": ["level"],
    "create.done": ["name"],
    "lookup.wait": ["seconds"],
    "lookup.found": [
      "name",
      "townHall",
      "builderHall",
      "achievements",
      "troops",
    ],
    "lookup.buildingLoaded": ["name"],
    "edit.done": ["name"],
    "delete.question": ["name"],
    "delete.activeNext": ["next"],
    "delete.done": ["name"],
  },
  arrays: [],
});
