import type { ReactNode } from "react";

import type { BuildingEditData } from "@/lib/utils/massEditHelpers";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { BuildingRecordKey } from "@/types/app/game";
import type { RunningSubject, StartUpgradeSubject } from "@/types/components/upgrades";

export interface UpgradeHandlers {
  onStart: (subject: StartUpgradeSubject, target: UpgradeTarget) => void;
  onFinish: (subject: RunningSubject) => void;
  onCancel: (subject: RunningSubject) => void;
  onLevelChange: (target: UpgradeTarget, level: number) => void;
}

export interface TargetRowProps extends UpgradeHandlers {
  village: Playthrough;
  target: UpgradeTarget;
  name: string;
  maxLevel: number;
  now: number;
  prefix?: ReactNode;
  note?: ReactNode;
  /** The level at which the target counts as built, for the Not built text. Defaults to the level 0 check. */
  hideStepperAtZero?: boolean;
}

export interface BuildingsTabProps extends UpgradeHandlers {
  village: Playthrough;
  buildings: BuildingEditData[];
  record: BuildingRecordKey;
  hideMax: boolean;
  now: number;
}

export interface BuildingCardProps extends UpgradeHandlers {
  village: Playthrough;
  building: BuildingEditData;
  record: BuildingRecordKey;
  now: number;
}

export interface TabProps extends UpgradeHandlers {
  village: Playthrough;
  hideMax: boolean;
  now: number;
}
