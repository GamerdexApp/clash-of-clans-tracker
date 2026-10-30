import { messages } from "@/i18n/text";

export const wallsText = messages<{
  title: string;
  subline: (name: string, townHall: number, highest: number) => string;
  massEdit: string;
  tiles: {
    total: string;
    totalCaption: (highest: number) => string;
    placed: string;
    placedCaption: string;
    notPlaced: string;
    allPlaced: string;
    stillToPlace: (count: number) => string;
    over: (count: number) => string;
  };
  hideEmpty: (hidden: number) => string;
  row: {
    level: (level: number) => string;
    own: string;
    ownLabel: (level: number) => string;
    lower: (level: number) => string;
    raise: (level: number) => string;
    nextCost: (price: string, resource: string) => string;
    toMove: string;
    toLevel: string;
    plusOne: string;
    move: string;
    moveAll: string;
    preview: (
      walls: number,
      from: number,
      to: number,
      price: string,
      resource: string,
    ) => string;
    nothingToMove: string;
    noWalls: string;
  };
  cost: {
    title: (level: number) => string;
    row: (level: number, walls: number) => string;
    total: string;
    none: string;
    note: string;
  };
  empty: {
    title: string;
    description: string;
  };
  toast: {
    moved: (walls: number, from: number, to: number) => string;
    counted: (level: number, from: number, to: number) => string;
    undo: string;
  };
}>("walls", {
  fns: {
    subline: ["name", "townHall", "highest"],
    "tiles.totalCaption": ["highest"],
    "tiles.stillToPlace": ["count:plural"],
    "tiles.over": ["count"],
    hideEmpty: ["hidden"],
    "row.level": ["level"],
    "row.ownLabel": ["level"],
    "row.lower": ["level"],
    "row.raise": ["level"],
    "row.nextCost": ["price", "resource"],
    "row.preview": ["walls:plural", "from", "to", "price", "resource"],
    "cost.title": ["level"],
    "cost.row": ["level", "walls:plural"],
    "toast.moved": ["walls:plural", "from", "to"],
    "toast.counted": ["level", "from", "to"],
  },
  arrays: [],
});

export const builderWallsText = messages<{
  title: string;
  subline: (name: string, builderHall: number, highest: number) => string;
  massEdit: string;
  tiles: {
    total: string;
    totalCaption: (highest: number) => string;
    placed: string;
    placedCaption: string;
    notPlaced: string;
    allPlaced: string;
    stillToPlace: (count: number) => string;
    over: (count: number) => string;
  };
  hideEmpty: (hidden: number) => string;
  row: {
    level: (level: number) => string;
    own: string;
    ownLabel: (level: number) => string;
    lower: (level: number) => string;
    raise: (level: number) => string;
    nextCost: (price: string, resource: string) => string;
    toMove: string;
    toLevel: string;
    plusOne: string;
    move: string;
    moveAll: string;
    preview: (
      walls: number,
      from: number,
      to: number,
      price: string,
      resource: string,
    ) => string;
    nothingToMove: string;
    noWalls: string;
  };
  cost: {
    title: (level: number) => string;
    row: (level: number, walls: number) => string;
    total: string;
    none: string;
    note: string;
  };
  empty: {
    title: string;
    description: string;
  };
  toast: {
    moved: (walls: number, from: number, to: number) => string;
    counted: (level: number, from: number, to: number) => string;
    undo: string;
  };
}>("builderWalls", {
  fns: {
    subline: ["name", "builderHall", "highest"],
    "tiles.totalCaption": ["highest"],
    "tiles.stillToPlace": ["count:plural"],
    "tiles.over": ["count"],
    hideEmpty: ["hidden"],
    "row.level": ["level"],
    "row.ownLabel": ["level"],
    "row.lower": ["level"],
    "row.raise": ["level"],
    "row.nextCost": ["price", "resource"],
    "row.preview": ["walls:plural", "from", "to", "price", "resource"],
    "cost.title": ["level"],
    "cost.row": ["level", "walls:plural"],
    "toast.moved": ["walls:plural", "from", "to"],
    "toast.counted": ["level", "from", "to"],
  },
  arrays: [],
});
