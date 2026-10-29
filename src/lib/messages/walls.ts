export const wallsText = {
  title: "Walls",
  subline: (name: string, townHall: number, highest: number) =>
    `${name}, Town Hall ${townHall}, Highest wall level ${highest}`,
  massEdit: "Wall counts can also be adjusted in Mass edit.",
  tiles: {
    total: "Total at this Town Hall",
    totalCaption: (highest: number) => `Highest wall level ${highest}`,
    placed: "Placed",
    placedCaption: "Walls on a level",
    notPlaced: "Not placed",
    allPlaced: "All placed",
    stillToPlace: (count: number) => `${count} ${count === 1 ? "wall" : "walls"} still to place`,
    over: (count: number) => `Over by ${count}`,
  },
  hideEmpty: (hidden: number) => (hidden > 0 ? `Hide empty levels below your lowest (${hidden} hidden)` : "Hide empty levels below your lowest"),
  row: {
    level: (level: number) => `Level ${level}`,
    own: "You own",
    ownLabel: (level: number) => `Walls you own on level ${level}`,
    lower: (level: number) => `One fewer wall on level ${level}`,
    raise: (level: number) => `One more wall on level ${level}`,
    nextCost: (price: string, resource: string) => `Next level: ${price} ${resource} per wall`,
    toMove: "Walls to move",
    toLevel: "To level",
    plusOne: "+1",
    move: "Move",
    moveAll: "Move all",
    preview: (walls: number, from: number, to: number, price: string, resource: string) =>
      `Move ${walls} ${walls === 1 ? "wall" : "walls"} from level ${from} to ${to}: ${price} ${resource}`,
    nothingToMove: "Nothing to move",
    noWalls: "No walls on this level to move.",
  },
  cost: {
    title: (level: number) => `Cost to bring all walls to level ${level}`,
    row: (level: number, walls: number) => `Level ${level}, ${walls} ${walls === 1 ? "wall" : "walls"}`,
    total: "Total",
    none: "Every placed wall is at the top level, or none are placed yet.",
    note: "Level 2 to 4 walls cost Gold. Level 5 and up cost Gold or Elixir.",
  },
  empty: {
    title: "No walls yet",
    description: "Walls unlock at Town Hall 2.",
  },
  toast: {
    moved: (walls: number, from: number, to: number) =>
      `${walls} ${walls === 1 ? "wall" : "walls"} moved from level ${from} to ${to}`,
    counted: (level: number, from: number, to: number) => `Level ${level} walls ${from} to ${to}`,
    undo: "Undo",
  },
} as const;

export const builderWallsText = {
  ...wallsText,
  title: "Builder Base walls",
  subline: (name: string, builderHall: number, highest: number) =>
    `${name}, Builder Hall ${builderHall}, Highest wall level ${highest}`,
  tiles: { ...wallsText.tiles, total: "Total at this Builder Hall" },
  cost: {
    ...wallsText.cost,
    note: "Level 2 to 6 walls cost Builder Gold. Level 7 and up cost Builder Gold or Builder Elixir.",
  },
  empty: {
    title: "No walls yet",
    description: "Set your Builder Hall level on the Builder Base Upgrades page to see its walls.",
  },
} as const;
