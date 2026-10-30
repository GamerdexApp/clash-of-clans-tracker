import { messages } from "@/i18n/text";

export const navText = messages<{
  groups: {
    homeVillage: string;
    builderBase: string;
    clanCapital: string;
    dailies: string;
    tools: string;
  };
  items: {
    overview: string;
    achievements: string;
    builder: string;
    research: string;
    pets: string;
    equipment: string;
    walls: string;
    builderBaseUpgrades: string;
    builderBaseTroops: string;
    builderBaseWalls: string;
    districts: string;
    capitalTroops: string;
    forge: string;
    helpers: string;
    seasonPass: string;
    massEdit: string;
    settings: string;
  };
  villages: string;
}>("nav", {
  fns: {},
  arrays: [],
});
