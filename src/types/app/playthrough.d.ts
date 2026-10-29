import type { VillageData } from "./game";

export interface DailyTimerData {
  /** "HH:MM" in local time; null = not yet configured */
  resetTime: string | null;
  /** ISO 8601; null = never collected this cycle */
  lastCollectedAt: string | null;
}

export interface GoldPassData {
  builderBoostPct: 0 | 10 | 15 | 20;
  researchBoostPct: 0 | 10 | 15 | 20;
  /** "YYYY-MM" — auto-reset when month changes */
  monthKey: string;
  hoggyBankUnlocked: boolean;
  gemDonationsUnlocked: boolean;
  autoForgeUnlocked: boolean;
  requestTimeReductionUnlocked: boolean;
}

export type HelperAssignmentTarget =
  | { type: "building"; recordKey: "defenses" | "armyBuildings" | "resourceBuildings" | "traps"; buildingId: string; instanceIndex: number }
  | { type: "hero"; name: string }
  | { type: "research"; researchKey: "troops" | "spells" | "siegeMachines"; name: string }
  | { type: "pet"; name: string };

export interface HelperAssignment {
  target: HelperAssignmentTarget;
  mode: "once" | "continuous";
}

export interface HelpersData {
  prospectorUnlocked: boolean;
  prospector: DailyTimerData;
  alchemist: DailyTimerData;
  buildersApprentice: DailyTimerData;
  labAssistant: DailyTimerData;
  buildersApprenticeLevel?: number;
  labAssistantLevel?: number;
  alchemistLevel?: number;
  buildersApprenticeAssignment?: HelperAssignment;
  labAssistantAssignment?: HelperAssignment;
}

export type ForgeResourceType = "gold" | "elixir" | "darkElixir" | "builderGold" | "builderElixir";

export interface AutoForgeData {
  /** ISO 8601 — when the forge completes; null = not running */
  endsAt: string | null;
  /** Resource being converted */
  resourceType: ForgeResourceType;
  /** Amount of resource being converted (user-entered in Dailies bar) */
  resourceAmount: number;
  /** Capital Gold output */
  capitalGoldOutput: number;
  /** Effective duration in ms at start time (accounts for builder boost) */
  durationMs: number;
}

export interface ForgeSlotData {
  // null = slot idle
  resourceType: ForgeResourceType | null;
  /** ISO 8601; null = not running */
  endsAt: string | null;
  /** Effective duration in ms at start time (accounts for builder boost) */
  durationMs: number;
  /** Expected CG output (from package lookup at start time) */
  capitalGoldOutput: number;
  /** Resource cost (from package lookup at start time) */
  resourceCost: number;
}

export interface DailiesData {
  helpers: HelpersData;
  starBonus: DailyTimerData;
  capitalGold: DailyTimerData;
  goldPass: GoldPassData;
  autoForge: AutoForgeData;
  /** Always 4 stored; display count gated by TH level */
  forgeSlots: ForgeSlotData[];
}

export interface Playthrough {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModified: string;
  /** ISO 8601 — set when TH level is assigned/changed; used for "Days at TH" counter */
  thChangedAt?: string;
  /** ISO 8601 — set when BH level is assigned/changed; used for "Days at BH" counter */
  bhChangedAt?: string;
  /** Whether the user has opted into tracking Clan Capital */
  clanCapitalEnabled?: boolean;
  oreStock?: { shiny: number; glowing: number; starry: number };
  /** Builder Base things that have no place in the saved Builder Base data. */
  bbExtras?: { clockTower?: { level: number; upgrade?: UpgradeState }; builderHallUpgrade?: UpgradeState };
  dailies?: DailiesData;
  data: VillageData;
}

export interface ActiveHours {
  /** Minutes from midnight UTC when active window opens */
  startUtcMinutes: number;
  /** Minutes from midnight UTC when active window closes */
  endUtcMinutes: number;
}

export type ThemeChoice = "light" | "dark" | "system";

export interface ActiveHoursLocal {
  /** "HH:MM" on the local clock */
  start: string;
  end: string;
}

export interface QueueWindows {
  builder?: string;
  research?: string;
  pets?: string;
  bbBuilder?: string;
  bbResearch?: string;
}

export interface UiSettings {
  hideMax?: boolean;
  /** Equipment: take the ore out of the stock on upgrade. A missing value reads as on. */
  deductOre?: boolean;
  builderTab?: string;
  massEdit?: { scope?: string; tab?: string; collapsedGroups?: string[] };
  queueWindows?: QueueWindows;
  hiddenCategories?: { builder?: string[]; research?: string[] };
}

export interface AppSettings {
  goblinBuilderEnabled: boolean;
  goblinResearchEnabled: boolean;
  activeHours?: ActiveHours;
  theme?: ThemeChoice;
  activeHoursLocal?: ActiveHoursLocal;
  ui?: UiSettings;
}

export interface AppData {
  playthroughs: Playthrough[];
  activePlaythroughId: string | null;
  settings?: AppSettings;
}

export type SortOption = "lastModified" | "name" | "createdAt";
