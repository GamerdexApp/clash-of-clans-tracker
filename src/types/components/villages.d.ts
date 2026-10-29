import type { PlayerApiResponse, Playthrough } from "@/types/app";
import type { ReactNode } from "react";

import type { VillageData } from "@/types/app/game";

export type CreationMode = "fresh" | "import";

export interface VillageFormValues {
  name: string;
  description: string;
  townHallChangedAt: string;
  builderHallChangedAt: string;
  trackCapital: boolean;
}

export interface VillageFieldsProps {
  values: VillageFormValues;
  onChange: (patch: Partial<VillageFormValues>) => void;
  showNameError: boolean;
  townHallLevel: number;
  /** Shows the Town Hall and Builder Hall level fields. Only a fresh village has them. */
  levels?: { townHall: number; builderHall: number; onChange: (townHall: number, builderHall: number) => void };
  notice?: string;
}

export interface PlayerLookupProps {
  tag: string;
  onTagChange: (tag: string) => void;
  onFetched: (player: PlayerApiResponse, data: VillageData) => void;
  fetchLabel: string;
  /** Shown after a successful fetch in place of the default summary. */
  result?: ReactNode;
}

export interface BuildingFileFieldProps {
  fileName: string;
  onLoaded: (data: VillageData | null, fileName: string) => void;
}

export interface VillageCardProps {
  village: Playthrough;
  isActive: boolean;
  onSetActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
