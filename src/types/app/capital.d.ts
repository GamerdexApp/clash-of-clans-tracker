import type { DistrictKey } from "@/lib/constants/capitalDistricts";

export type ZoneId = "capitalPeak" | DistrictKey;

export type CapitalGroup = "defenses" | "traps" | "army" | "walls";

export interface CapitalZone {
  id: ZoneId;
  label: string;
}

export interface CapitalArmyEntry {
  name: string;
  kind: "troops" | "spells";
  imageUrl: string;
  district: string;
  level: number;
  /** The highest level the District Hall allows, or 0 when the entry is locked. */
  maxLevel: number;
  topLevel: number;
  /** What a locked entry needs. A null Capital Hall means the zone is open and only its District Hall is missing. */
  requirement: { capitalHall: number | null; districtHall: number; zone: string } | null;
}
