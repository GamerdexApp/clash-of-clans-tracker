import type { AppData, AppSettings, Playthrough } from "@/types/app";
import type { HomeVillageData, BuilderBaseData } from "@/types/app/game";
import type { DailiesData } from "@/types/app/playthrough";

const STORAGE_KEY = "clash-of-clans-tracker";

const defaultSettings: AppSettings = {
  goblinBuilderEnabled: false,
  goblinResearchEnabled: false,
};

const defaultData: AppData = {
  playthroughs: [],
  activePlaythroughId: null,
  settings: defaultSettings,
};

export { defaultSettings };

/**
 * Fills in missing fields on stored data so old records are always safe to use.
 * Add an entry here any time a new required field is added to the data model.
 */
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

const emptyTimer = { resetTime: null, lastCollectedAt: null };

const defaultDailies: DailiesData = {
  helpers: {
    prospectorUnlocked: false,
    prospector: emptyTimer,
    alchemist: emptyTimer,
    buildersApprentice: emptyTimer,
    labAssistant: emptyTimer,
  },
  starBonus: emptyTimer,
  capitalGold: emptyTimer,
  goldPass: {
    builderBoostPct: 0,
    researchBoostPct: 0,
    monthKey: "",
    hoggyBankUnlocked: false,
    gemDonationsUnlocked: false,
    autoForgeUnlocked: false,
    requestTimeReductionUnlocked: false,
  },
  autoForge: { endsAt: null, resourceType: "gold", resourceAmount: 0, capitalGoldOutput: 0, durationMs: 0 },
  forgeSlots: Array.from({ length: 4 }, () => ({
    resourceType: null,
    endsAt: null,
    durationMs: 0,
    capitalGoldOutput: 0,
    resourceCost: 0,
  })),
};

export { defaultDailies };

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

const migratePlaythrough = (p: Playthrough): Playthrough  => {
  if (!p.data) return p;
  return {
    ...p,
    dailies: migrateDailies(p.dailies),
    data: {
      ...p.data,
      homeVillage: migrateHomeVillage(p.data.homeVillage),
      builderBase: migrateBuilderBase(p.data.builderBase),
    },
  };
}

export const storageService = {
  /**
   * Load data from localStorage, migrating any old records to the current schema.
   */
  load(): AppData {
    if (typeof window === "undefined") return defaultData;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultData;

    // Let parse/migration errors throw — the caller (PlaythroughContext) will
    // surface them as a React error rather than silently wiping all data.
    const parsed = JSON.parse(stored) as AppData;
    return {
      ...parsed,
      playthroughs: (parsed.playthroughs ?? []).map(migratePlaythrough),
      settings: parsed.settings ? { ...defaultSettings, ...parsed.settings } : defaultSettings,
    };
  },

  /**
   * Save data to localStorage
   */
  save(data: AppData): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  },

  /**
   * Export data as a formatted JSON string
   */
  exportData(): string {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import data from a JSON string, replacing all existing data
   */
  importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString) as AppData;

      if (!data.playthroughs || !Array.isArray(data.playthroughs)) {
        return {
          success: false,
          error: "Invalid data format: missing playthroughs array",
        };
      }

      this.save(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  /**
   * Remove all data from localStorage
   */
  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Add a new playthrough (direct localStorage write, bypasses Context)
   */
  addPlaythrough(playthrough: Playthrough): void {
    const data = this.load();
    data.playthroughs.push(playthrough);

    if (data.playthroughs.length === 1) {
      data.activePlaythroughId = playthrough.id;
    }

    this.save(data);
  },

  /**
   * Update an existing playthrough (direct localStorage write, bypasses Context)
   */
  updatePlaythrough(id: string, updates: Partial<Playthrough>): void {
    const data = this.load();
    const index = data.playthroughs.findIndex((p) => p.id === id);

    if (index !== -1) {
      data.playthroughs[index] = {
        ...data.playthroughs[index],
        ...updates,
        lastModified: new Date().toISOString(),
      };
      this.save(data);
    }
  },

  /**
   * Delete a playthrough (direct localStorage write, bypasses Context)
   */
  deletePlaythrough(id: string): void {
    const data = this.load();
    data.playthroughs = data.playthroughs.filter((p) => p.id !== id);

    if (data.activePlaythroughId === id) {
      data.activePlaythroughId = data.playthroughs[0]?.id || null;
    }

    this.save(data);
  },

  /**
   * Persist a settings patch to localStorage (direct write, bypasses Context)
   */
  saveSettings(patch: Partial<AppSettings>): void {
    const data = this.load();
    data.settings = { ...(data.settings ?? defaultSettings), ...patch };
    this.save(data);
  },

  /**
   * Set the active playthrough (direct localStorage write, bypasses Context)
   */
  setActivePlaythrough(id: string | null): void {
    const data = this.load();
    data.activePlaythroughId = id;
    this.save(data);
  },
};
