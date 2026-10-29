import type { AppData, Playthrough } from "@/types/app";

export interface ParseStats {
  read: number;
  skipped: number;
}

export type BackupError = "notJson" | "playthroughsMissing";

type ParseResult =
  | { ok: true; data: AppData; stats: ParseStats }
  | { ok: false; error: BackupError };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasVillageData = (value: unknown) =>
  isRecord(value) &&
  isRecord(value.homeVillage) &&
  isRecord(value.builderBase) &&
  isRecord(value.clanCapital);

const isVillage = (value: unknown): value is Playthrough =>
  isRecord(value) &&
  typeof value.id === "string" &&
  value.id.trim() !== "" &&
  typeof value.name === "string" &&
  hasVillageData(value.data);

const timestamp = (iso: unknown) => (typeof iso === "string" ? Date.parse(iso) || 0 : 0);

const mostRecentlyModified = (villages: Playthrough[]): Playthrough | null =>
  villages.reduce<Playthrough | null>(
    (latest, village) =>
      latest === null || timestamp(village.lastModified) > timestamp(latest.lastModified)
        ? village
        : latest,
    null,
  );

const rejected = (error: BackupError): ParseResult => ({ ok: false, error });

/**
 * Checks the content of a backup file and saves nothing. A village without an id, a name or the
 * three village sections is skipped, and a repeated id keeps its first entry. Unknown fields stay,
 * so a file from a later version loads unchanged. A missing active id falls back to the most
 * recently updated village.
 */
export const parseBackupData = (raw: unknown): ParseResult => {
  if (!isRecord(raw) || !Array.isArray(raw.playthroughs)) return rejected("playthroughsMissing");

  const seen = new Set<string>();
  const villages = raw.playthroughs.filter(isVillage).filter((village) => {
    if (seen.has(village.id)) return false;
    seen.add(village.id);
    return true;
  });

  const requestedActive = typeof raw.activePlaythroughId === "string" ? raw.activePlaythroughId : null;
  const activePlaythroughId = seen.has(requestedActive ?? "")
    ? requestedActive
    : (mostRecentlyModified(villages)?.id ?? null);

  return {
    ok: true,
    data: { ...raw, playthroughs: villages, activePlaythroughId } as AppData,
    stats: { read: raw.playthroughs.length, skipped: raw.playthroughs.length - villages.length },
  };
};

export const parseBackup = (text: string): ParseResult => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return rejected("notJson");
  }
  return parseBackupData(raw);
};

export type ImportMode = "merge" | "replace";

export type ImportRowResult = "added" | "updated" | "kept" | "replaced" | "removed";

export interface ImportRow {
  name: string;
  fileModified?: string;
  deviceModified?: string;
  result: ImportRowResult;
}

export const planImport = (current: AppData, incoming: AppData, mode: ImportMode): ImportRow[] => {
  const onDevice = new Map(current.playthroughs.map((village) => [village.id, village]));

  const rows: ImportRow[] = incoming.playthroughs.map((village) => {
    const existing = onDevice.get(village.id);
    const base = { name: village.name, fileModified: village.lastModified };
    if (mode === "replace") {
      return { ...base, deviceModified: existing?.lastModified, result: "replaced" };
    }
    if (!existing) return { ...base, result: "added" };
    return {
      ...base,
      deviceModified: existing.lastModified,
      result: timestamp(village.lastModified) > timestamp(existing.lastModified) ? "updated" : "kept",
    };
  });

  const incomingIds = new Set(incoming.playthroughs.map((village) => village.id));
  current.playthroughs
    .filter((village) => !incomingIds.has(village.id))
    .forEach((village) =>
      rows.push({
        name: village.name,
        deviceModified: village.lastModified,
        result: mode === "replace" ? "removed" : "kept",
      }),
    );
  return rows;
};

/**
 * Replace uses the file as it is. Merge adds villages with new ids and keeps the later
 * `lastModified` for a matching id. Settings and the active village on this device stay.
 */
export const applyImport = (current: AppData, incoming: AppData, mode: ImportMode): AppData => {
  if (mode === "replace") return incoming;

  const incomingById = new Map(incoming.playthroughs.map((village) => [village.id, village]));
  const merged = current.playthroughs.map((village) => {
    const fromFile = incomingById.get(village.id);
    return fromFile && timestamp(fromFile.lastModified) > timestamp(village.lastModified)
      ? fromFile
      : village;
  });
  const knownIds = new Set(current.playthroughs.map((village) => village.id));
  const playthroughs = [...merged, ...incoming.playthroughs.filter((village) => !knownIds.has(village.id))];

  const activeStillExists = playthroughs.some((village) => village.id === current.activePlaythroughId);

  return {
    ...incoming,
    ...current,
    playthroughs,
    activePlaythroughId: activeStillExists
      ? current.activePlaythroughId
      : (mostRecentlyModified(playthroughs)?.id ?? null),
  };
};

export interface ImportResultCount {
  result: ImportRowResult;
  count: number;
}

export const summarizeImport = (rows: ImportRow[]): ImportResultCount[] =>
  (["added", "updated", "kept", "replaced", "removed"] as ImportRowResult[])
    .map((result) => ({ result, count: rows.filter((row) => row.result === result).length }))
    .filter(({ count }) => count > 0);

const pad = (value: number) => String(value).padStart(2, "0");

export const backupFileName = (date = new Date()) =>
  `coc-tracker-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;

export const backupText = (data: AppData) => JSON.stringify(data, null, 2);

export const downloadBackup = (data: AppData): string => {
  const fileName = backupFileName();
  const blob = new Blob([backupText(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return fileName;
};
