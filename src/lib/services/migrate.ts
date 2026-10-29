import { defaultDailies } from "./defaultDailies";
import { spreadSharedBuilders } from "./upgradeEngine";
import type { AppSettings, Playthrough } from "@/types/app";
import type { HomeVillageData, BuilderBaseData } from "@/types/app/game";
import type { DailiesData } from "@/types/app/playthrough";

export const defaultSettings: AppSettings = {
  goblinBuilderEnabled: false,
  goblinResearchEnabled: false,
};

const migrateHomeVillage = (hv: HomeVillageData): HomeVillageData  => {
  const defaultWeaponLevel = hv.townHallLevel === 17 ? 1 : 0;
  return {
    ...hv,
    craftedDefenses: hv.craftedDefenses ?? {},
    builderQueues: hv.builderQueues ?? {},
    researchQueue: hv.researchQueue ?? {},
    petQueue: hv.petQueue ?? [],
    townHallWeaponLevel: hv.townHallWeaponLevel ?? defaultWeaponLevel,
  };
}

const migrateBuilderBase = (bb: BuilderBaseData): BuilderBaseData  => {
  return {
    ...bb,
    traps: bb.traps ?? {},
    walls: bb.walls ?? {},
  };
}

const migrateDailies = (existing: DailiesData | undefined): DailiesData  => {
  if (!existing) return defaultDailies;
  return {
    ...defaultDailies,
    ...existing,
    helpers: {
      ...defaultDailies.helpers,
      ...(existing.helpers ?? {}),
      prospectorUnlocked: existing.helpers?.prospectorUnlocked ?? false,
    },
    goldPass: existing.goldPass
      ? { ...defaultDailies.goldPass, ...existing.goldPass }
      : defaultDailies.goldPass,
    autoForge: existing.autoForge
      ? { ...defaultDailies.autoForge, ...existing.autoForge }
      : defaultDailies.autoForge,
    forgeSlots: existing.forgeSlots ?? defaultDailies.forgeSlots,
  };
}

export const migratePlaythrough = (p: Playthrough): Playthrough  => {
  if (!p.data) return p;
  return spreadSharedBuilders({
    ...p,
    dailies: migrateDailies(p.dailies),
    data: {
      ...p.data,
      homeVillage: migrateHomeVillage(p.data.homeVillage),
      builderBase: migrateBuilderBase(p.data.builderBase),
    },
  });
}
