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
  addPlaythrough: (
    playthrough: Omit<Playthrough, "id" | "createdAt" | "lastModified">,
  ) => void;
  updatePlaythrough: (id: string, updates: Partial<Playthrough>) => void;
  deletePlaythrough: (id: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  importData: (jsonString: string) => { success: boolean; error?: string };
  exportData: () => string;
  clearAllData: () => void;
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
