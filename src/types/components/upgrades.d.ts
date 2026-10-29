import type { ReactNode } from "react";

import type { Playthrough } from "@/types/app";
import type { BoostPercent, BuilderSlotState, BuilderSlots, FinishMethod, LaneKind, UpgradeTarget } from "@/types/app/engine";
import type { UpgradeStep } from "@/types/app/upgrade";

export interface StartUpgradeSubject {
  name: string;
  fromLevel: number;
  step: UpgradeStep;
}

export interface StartUpgradeDialogProps {
  subject: StartUpgradeSubject | null;
  village: Playthrough;
  boostPercent: BoostPercent;
  lane: LaneKind;
  lanes: BuilderSlotState[];
  now: number;
  onConfirm: (builderId: number) => void;
  onClose: () => void;
}

export interface RunningSubject {
  target: UpgradeTarget;
  name: string;
  fromLevel: number;
  finishesAt: string;
  builderLabel: string;
  step: UpgradeStep | null;
}

export interface FinishUpgradeDialogProps {
  subject: RunningSubject | null;
  now: number;
  onConfirm: (method: FinishMethod) => void;
  onClose: () => void;
}

export interface CancelUpgradeDialogProps {
  subject: RunningSubject | null;
  now: number;
  onConfirm: () => void;
  onClose: () => void;
}

export interface LanesStripProps {
  title: string;
  village: Playthrough;
  state: BuilderSlots;
  now: number;
  /** The queue page the strip opens. Omitted until that page exists. */
  queueHref?: string;
  queueLabel?: string;
  emptyNote: string;
  unassignedHelp: string;
  gridClassName?: string;
  /** Labeled facts shown under the title, such as the building level and the Gold Pass boost. */
  stats?: Array<{ label: string; value: string }>;
  actions?: ReactNode;
}
