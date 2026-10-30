export const DISTRICTS = [
  { id: "barbarianCamp", label: "Barbarian Camp", key: "barbarianCamp" }, // i18n-ignore
  { id: "wizardValley", label: "Wizard Valley", key: "wizardValley" }, // i18n-ignore
  { id: "balloonLagoon", label: "Balloon Lagoon", key: "balloonLagoon" }, // i18n-ignore
  {
    id: "buildersWorkshop",
    label: "Builder's Workshop", // i18n-ignore
    key: "buildersWorkshop",
  }, // i18n-ignore
  { id: "dragonCliffs", label: "Dragon Cliffs", key: "dragonCliffs" }, // i18n-ignore
  { id: "golemQuarry", label: "Golem Quarry", key: "golemQuarry" }, // i18n-ignore
  { id: "skeletonPark", label: "Skeleton Park", key: "skeletonPark" }, // i18n-ignore
  { id: "goblinMines", label: "Goblin Mines", key: "goblinMines" }, // i18n-ignore
] as const;

export type DistrictKey = (typeof DISTRICTS)[number]["key"];
