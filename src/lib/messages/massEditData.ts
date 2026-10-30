import { messages } from "@/i18n/text";

export const massEditDataText = messages<{
  categories: {
    defenses: string;
    army: string;
    resources: string;
    crafted: string;
    traps: string;
    troops: string;
    spells: string;
    siege: string;
    pets: string;
    guardians: string;
    heroes: string;
    equipment: string;
    walls: string;
    buildings: string;
  };
  sections: {
    armyBuildings: string;
    otherBuildings: string;
  };
  level: (level: number) => string;
  superchargeRow: (name: string) => string;
  profile: {
    builderHall: string;
    trophies: string;
    bestTrophies: string;
    league: string;
    capitalHall: string;
    districtHall: (zone: string) => string;
    contributions: string;
  };
}>("massEditData", {
  fns: {
    level: ["level"],
    superchargeRow: ["name"],
    "profile.districtHall": ["zone"],
  },
  arrays: [],
});
