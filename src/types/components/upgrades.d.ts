import type { Playthrough } from "@/types/app";
import type { BoostPercent, FinishMethod, UpgradeTarget } from "@/types/app/engine";
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
  goblinBuilderEnabled: boolean;
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
