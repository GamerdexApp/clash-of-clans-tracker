import type { AppData } from "@/types/app";

import { defaultDailies, defaultSettings, migratePlaythrough } from "./migrate";

export { defaultDailies, defaultSettings };

export const STORAGE_KEY = "clash-of-clans-tracker";

export const EMPTY_APP_DATA: AppData = {
  playthroughs: [],
  activePlaythroughId: null,
  settings: defaultSettings,
};

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedData: AppData = EMPTY_APP_DATA;

const notifyListeners = () => listeners.forEach((listener) => listener());

const parseStored = (raw: string | null): AppData => {
  if (raw === null) return EMPTY_APP_DATA;
  const parsed = JSON.parse(raw) as AppData;
  return {
    ...parsed,
    playthroughs: (parsed.playthroughs ?? []).map(migratePlaythrough),
    settings: parsed.settings ? { ...defaultSettings, ...parsed.settings } : defaultSettings,
  };
};

export const storageService = {
  /** Returns the same object until the stored text changes, as `useSyncExternalStore` requires. */
  load(): AppData {
    if (typeof window === "undefined") return EMPTY_APP_DATA;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === cachedRaw) return cachedData;

      cachedData = parseStored(raw);
      cachedRaw = raw;
      return cachedData;
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      return EMPTY_APP_DATA;
    }
  },

  loadOnServer(): AppData {
    return EMPTY_APP_DATA;
  },

  save(data: AppData): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      notifyListeners();
      return true;
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
      return false;
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    notifyListeners();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  },
};
