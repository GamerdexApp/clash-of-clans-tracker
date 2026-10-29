import type { AppData, Playthrough } from "@/types/app";
import { createDefaultVillageData } from "@/lib/utils/villageHelpers";

const timestamp = "2026-01-05T10:00:00.000Z";

export const freshVillage = (id: string, name: string): Playthrough => ({
  id,
  name,
  createdAt: timestamp,
  lastModified: timestamp,
  data: createDefaultVillageData(),
});

/** A save written before the queue, crafted defense and dailies fields existed. */
export const oldVillageWithoutOptionalFields = (): Playthrough => {
  const village = freshVillage("old-1", "Old village");
  const { craftedDefenses, builderQueues, researchQueue, petQueue, townHallWeaponLevel, ...home } =
    village.data.homeVillage;
  void [craftedDefenses, builderQueues, researchQueue, petQueue, townHallWeaponLevel];
  const { traps, walls, ...builderBase } = village.data.builderBase;
  void [traps, walls];
  return {
    ...village,
    data: { ...village.data, homeVillage: home, builderBase } as Playthrough["data"],
  };
};

export const villageWithUnknownFields = (): Playthrough =>
  ({
    ...freshVillage("unknown-1", "Has extras"),
    futureField: { keep: true },
    description: "kept",
  }) as Playthrough;

export const savedFixtures = (): AppData => ({
  playthroughs: [
    freshVillage("a", "First"),
    oldVillageWithoutOptionalFields(),
    villageWithUnknownFields(),
  ],
  activePlaythroughId: "old-1",
  settings: { goblinBuilderEnabled: true, goblinResearchEnabled: false },
});
