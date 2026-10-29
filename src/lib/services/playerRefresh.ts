import { mergeApiAchievements } from "@/lib/utils/achievementHelpers";
import type { TrackedEquipment, TrackedHero, TrackedItem, VillageData } from "@/types/app/game";

export interface RefreshResult {
  data: VillageData;
  updated: string[];
  untouched: string[];
  townHallChanged: boolean;
  builderHallChanged: boolean;
}

const mergeItems = (existing: TrackedItem[], fromApi: TrackedItem[]): TrackedItem[] => {
  const byName = new Map(fromApi.map((item) => [item.name, item]));
  const merged = existing.map((item) => {
    const api = byName.get(item.name);
    if (!api) return item;
    return api.level === item.level ? item : { ...item, level: api.level, upgrade: undefined };
  });
  const known = new Set(existing.map((item) => item.name));
  return [...merged, ...fromApi.filter((item) => !known.has(item.name))];
};

const mergeEquipment = (
  existing: TrackedEquipment[],
  fromApi: TrackedEquipment[],
): TrackedEquipment[] => {
  const byName = new Map(fromApi.map((piece) => [piece.name, piece]));
  const merged = existing.map((piece) => {
    const api = byName.get(piece.name);
    return api ? { ...piece, level: api.level } : piece;
  });
  const known = new Set(existing.map((piece) => piece.name));
  return [...merged, ...fromApi.filter((piece) => !known.has(piece.name))];
};

const mergeHeroes = (existing: TrackedHero[], fromApi: TrackedHero[]): TrackedHero[] => {
  const byName = new Map(fromApi.map((hero) => [hero.name, hero]));
  const merged = existing.map((hero) => {
    const api = byName.get(hero.name);
    if (!api) return hero;
    return {
      ...hero,
      level: api.level,
      upgrade: api.level === hero.level ? hero.upgrade : undefined,
      equipment: mergeEquipment(hero.equipment ?? [], api.equipment),
    };
  });
  const known = new Set(existing.map((hero) => hero.name));
  return [...merged, ...fromApi.filter((hero) => !known.has(hero.name))];
};

const mergeAchievements = (existing: VillageData["achievements"], fromApi: VillageData["achievements"]) => {
  const apiKeys = new Set(fromApi.map((a) => `${a.name}::${a.village}`));
  const kept = existing.filter((a) => !apiKeys.has(`${a.name}::${a.village}`));
  return [...mergeApiAchievements(fromApi, existing), ...kept];
};

/**
 * Writes only the fields that the player API returns. Anything the API does not return, such as
 * buildings, queues, Clan Capital districts, the Town Hall upgrade and the weapon level, stays.
 */
export const refreshFromPlayerApi = (existing: VillageData, api: VillageData): RefreshResult => {
  const data: VillageData = {
    ...existing,
    playerTag: api.playerTag,
    expLevel: api.expLevel,
    warStars: api.warStars,
    donations: api.donations,
    donationsReceived: api.donationsReceived,
    warPreference: api.warPreference,
    clan: api.clan,
    homeVillage: {
      ...existing.homeVillage,
      townHallLevel: api.homeVillage.townHallLevel,
      trophies: api.homeVillage.trophies,
      bestTrophies: api.homeVillage.bestTrophies,
      leagueName: api.homeVillage.leagueName,
      attackWins: api.homeVillage.attackWins,
      defenseWins: api.homeVillage.defenseWins,
      troops: mergeItems(existing.homeVillage.troops, api.homeVillage.troops),
      spells: mergeItems(existing.homeVillage.spells, api.homeVillage.spells),
      siegeMachines: mergeItems(existing.homeVillage.siegeMachines, api.homeVillage.siegeMachines),
      pets: mergeItems(existing.homeVillage.pets, api.homeVillage.pets),
      heroes: mergeHeroes(existing.homeVillage.heroes, api.homeVillage.heroes),
    },
    builderBase: {
      ...existing.builderBase,
      builderHallLevel: api.builderBase.builderHallLevel,
      builderBaseTrophies: api.builderBase.builderBaseTrophies,
      bestBuilderBaseTrophies: api.builderBase.bestBuilderBaseTrophies,
      builderBaseLeagueName: api.builderBase.builderBaseLeagueName,
      troops: mergeItems(existing.builderBase.troops, api.builderBase.troops),
      heroes: mergeHeroes(existing.builderBase.heroes, api.builderBase.heroes),
    },
    clanCapital: {
      ...existing.clanCapital,
      clanCapitalContributions: api.clanCapital.clanCapitalContributions,
    },
    achievements: mergeAchievements(existing.achievements, api.achievements),
  };

  return {
    data,
    updated: [
      "Profile and clan",
      "Town Hall and Builder Hall levels",
      "Trophies and leagues",
      "Troops, spells, siege machines and pets",
      "Heroes and equipment levels",
      "Clan Capital contributions",
      "Achievements",
    ],
    untouched: [
      "Buildings and walls",
      "Upgrade queues and running timers",
      "Clan Capital districts, troops and spells",
      "Town Hall upgrade and weapon level",
    ],
    townHallChanged: api.homeVillage.townHallLevel !== existing.homeVillage.townHallLevel,
    builderHallChanged: api.builderBase.builderHallLevel !== existing.builderBase.builderHallLevel,
  };
};
