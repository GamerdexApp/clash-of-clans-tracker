import { messages } from "@/i18n/text";

export const gameText = messages<{
  resources: {
    gold: string;
    elixir: string;
    darkElixir: string;
    darkElixirShort: string;
    builderGold: string;
    builderGoldShort: string;
    builderElixir: string;
    builderElixirShort: string;
    capitalGold: string;
    shinyOre: string;
    glowyOre: string;
    starryOre: string;
  };
  halls: {
    townHall: (level: number) => string;
    builderHall: (level: number) => string;
    capitalHall: (level: number) => string;
    heroHall: (level: number) => string;
    starLaboratory: (level: number) => string;
    blacksmith: string;
  };
  places: {
    townHall: string;
    townHallWeapon: string;
    builderHall: string;
    clockTower: string;
    laboratory: string;
    goblinResearcher: string;
    goblinBuilder: string;
    starLaboratory: string;
    petHouse: string;
    capitalPeak: string;
    builder: (id: number) => string;
  };
}>("game", {
  fns: {
    "halls.townHall": ["level"],
    "halls.builderHall": ["level"],
    "halls.capitalHall": ["level"],
    "halls.heroHall": ["level"],
    "halls.starLaboratory": ["level"],
    "places.builder": ["id"],
  },
  arrays: [],
});
