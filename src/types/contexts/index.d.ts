import { AppData, AppSettings, Playthrough } from "@/types/app";

export interface PlaythroughContextType {
  appData: AppData;
  lastSavedAt: Date | null;
  saveFailed: boolean;
  /** Applies `update` to the latest stored data. Returns the data before the change, or null when the write failed. */
  updateData: (update: (current: AppData) => AppData) => AppData | null;
  playthroughs: Playthrough[];
  activePlaythrough: Playthrough | null;
  isLoaded: boolean;
  appSettings: AppSettings;
  setActivePlaythrough: (id: string | null) => void;
  /** Returns the new village id, or null when the write failed. */
  addPlaythrough: (
    playthrough: Omit<Playthrough, "id" | "createdAt" | "lastModified">,
    options?: { makeActive?: boolean },
  ) => string | null;
  updatePlaythrough: (id: string, updates: Partial<Playthrough>) => void;
  /** Returns the data before the delete, or null when the write failed. */
  deletePlaythrough: (id: string) => AppData | null;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

export interface UIContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export interface SaveFABProps {
  isDirty: boolean;
  onSave: () => boolean;
}
