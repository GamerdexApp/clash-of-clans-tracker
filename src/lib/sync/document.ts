import { parseBackupData } from "@/service/backup";
import { storageService } from "@/service/storage";
import type { AppData } from "@/types/app";
import { fromSyncShape, toSyncShape } from "./shape";

/** What the sync package merges and keeps in the cloud. See `shape.ts`. */
export type SyncDocument = unknown;

export const isSyncDocument = (shape: unknown): boolean => parseBackupData(fromSyncShape(shape)).ok;

export const readLocalDocument = (): SyncDocument => toSyncShape(storageService.load());

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The active village is a choice of each device, so only the villages and the settings are
 * applied. When another device deleted the active village, this device has none active and never
 * picks one from the cloud.
 */
export const applyDocument = (shape: SyncDocument): boolean => {
  const incoming: AppData = fromSyncShape(shape);
  const current = storageService.load();
  if (sameJson(current.playthroughs, incoming.playthroughs) && sameJson(current.settings, incoming.settings)) return false;

  const activeStillExists = incoming.playthroughs.some((village) => village.id === current.activePlaythroughId);
  return storageService.save({
    ...current,
    playthroughs: incoming.playthroughs,
    settings: incoming.settings ?? current.settings,
    activePlaythroughId: activeStillExists ? current.activePlaythroughId : null,
  });
};

export const hasVillages = (shape: SyncDocument) => (fromSyncShape(shape).playthroughs ?? []).length > 0;
