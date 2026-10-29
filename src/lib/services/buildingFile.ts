import { isExportDataFormat, mapExportDataToVillageData } from "@/lib/utils/exportDataMapper";
import type { VillageData } from "@/types/app/game";

export type BuildingFileResult =
  | { ok: true; data: VillageData }
  | { ok: false; error: "notJson" | "notBuildingData" };

const isVillageData = (value: Partial<VillageData>): value is VillageData =>
  Boolean(value.homeVillage && value.builderBase && value.clanCapital);

/** Reads the game's exportData.json or a village exported from this app. */
export const parseBuildingFile = (text: string): BuildingFileResult => {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "notJson" };
  }
  if (isExportDataFormat(json)) return { ok: true, data: mapExportDataToVillageData(json) };
  if (typeof json === "object" && json !== null && isVillageData(json)) {
    return { ok: true, data: json };
  }
  return { ok: false, error: "notBuildingData" };
};
