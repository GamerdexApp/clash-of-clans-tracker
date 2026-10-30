import { messages } from "@/i18n/text";

export const massEditText = messages<{
  title: string;
  description: string;
  subline: (name: string, townHall: number) => string;
  scopes: {
    home: string;
    builder: string;
    capital: string;
  };
  scopeNav: string;
  requires: (requirement: string) => string;
  trackingOff: string;
  changedCount: (count: number) => string;
  chip: string;
  bar: {
    unsaved: (count: number) => string;
    none: string;
    discard: string;
    save: string;
  };
  saved: (count: number) => string;
  undo: string;
  discardDialog: {
    title: (count: number) => string;
    body: string;
    keep: string;
    discard: string;
  };
  leave: {
    title: (count: number) => string;
    body: string;
    save: string;
    discard: string;
    keep: string;
  };
  toolbar: {
    label: string;
    selectAll: (count: number) => string;
    selected: (count: number) => string;
    clearSelection: string;
    scopeAll: (count: number, category: string) => string;
    scopeSelected: (count: number) => string;
    max: string;
    maxSelected: string;
    reset: string;
    resetSelected: string;
    setLevel: string;
    levelLabel: string;
    applyLevel: (count: number) => string;
    hallLabel: string;
    hallCurrent: (hall: string, level: number) => string;
    hallOption: (hall: string, level: number) => string;
    hallPlaceholder: (hall: string) => string;
  };
  confirm: {
    title: (count: number) => string;
    body: string;
    superchargeNote: string;
    apply: string;
    cancel: string;
    line: (name: string, from: number, to: number) => string;
    more: (count: number) => string;
  };
  rows: {
    notBuilt: string;
    toMax: (count: number) => string;
    atMax: string;
    changed: (from: number, to: number) => string;
    level: (name: string) => string;
    raise: (name: string) => string;
    lower: (name: string) => string;
    max: string;
    select: (name: string) => string;
    selectGroup: (name: string) => string;
    supercharge: string;
    reachFirst: (level: number) => string;
    slider: (name: string) => string;
    groupBuilt: (count: number, max: number) => string;
    expand: (name: string) => string;
    collapse: (name: string) => string;
  };
  category: {
    atMax: (done: number, total: number, hall: string, level: number) => string;
    rowsAtMax: (done: number, total: number) => string;
    empty: string;
    locked: (requirement: string) => string;
    lockedSuffix: string;
    nav: string;
  };
  walls: {
    total: string;
    allocated: string;
    remaining: string;
    maxAll: string;
    resetAll: string;
    maxAllHelp: string;
    level: (level: number) => string;
  };
  builder: {
    profile: string;
    hall: string;
    hallHelp: (level: number) => string;
    none: string;
    raise: string;
    lower: string;
    trophies: string;
    bestTrophies: string;
    league: string;
    hallConfirmTitle: (level: number) => string;
  };
  hallNames: {
    home: string;
    builder: string;
    district: string;
    capital: string;
  };
  capital: {
    profile: string;
    hall: string;
    none: string;
    level: (level: number) => string;
    contributions: string;
    unit: string;
    districtHall: string;
    districtNone: string;
    districtLevel: (level: number) => string;
    requiresCapitalHall: (level: number) => string;
    unlockHint: (label: string) => string;
    parts: string;
    off: string;
    offBody: string;
    offAction: string;
  };
  empty: {
    title: string;
    description: string;
  };
}>("massEdit", {
  fns: {
    subline: ["name", "townHall"],
    requires: ["requirement"],
    changedCount: ["count:plural"],
    "bar.unsaved": ["count:plural"],
    saved: ["count:plural"],
    "discardDialog.title": ["count:plural"],
    "leave.title": ["count:plural"],
    "toolbar.selectAll": ["count"],
    "toolbar.selected": ["count:plural"],
    "toolbar.scopeAll": ["count", "category"],
    "toolbar.scopeSelected": ["count:plural"],
    "toolbar.applyLevel": ["count:plural"],
    "toolbar.hallCurrent": ["hall", "level"],
    "toolbar.hallOption": ["hall", "level"],
    "toolbar.hallPlaceholder": ["hall"],
    "confirm.title": ["count:plural"],
    "confirm.line": ["name", "from", "to"],
    "confirm.more": ["count"],
    "rows.toMax": ["count"],
    "rows.changed": ["from", "to"],
    "rows.level": ["name"],
    "rows.raise": ["name"],
    "rows.lower": ["name"],
    "rows.select": ["name"],
    "rows.selectGroup": ["name"],
    "rows.reachFirst": ["level"],
    "rows.slider": ["name"],
    "rows.groupBuilt": ["count", "max"],
    "rows.expand": ["name"],
    "rows.collapse": ["name"],
    "category.atMax": ["done", "total", "hall", "level"],
    "category.rowsAtMax": ["done", "total"],
    "category.locked": ["requirement"],
    "walls.level": ["level"],
    "builder.hallHelp": ["level"],
    "builder.hallConfirmTitle": ["level"],
    "capital.level": ["level"],
    "capital.districtLevel": ["level"],
    "capital.requiresCapitalHall": ["level"],
    "capital.unlockHint": ["label"],
  },
  arrays: [],
});
