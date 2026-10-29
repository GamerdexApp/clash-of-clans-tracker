import type { Playthrough } from "@/types/app";
import type { UpgradeGroup } from "@/types/app/available";
import type { BoostPercent } from "@/types/app/engine";
import type { BuilderQueueItem } from "@/types/app/queue";
import type { LaneSchedule, QueueConflict, QueueSchedule } from "@/types/app/queueEngine";

export interface LaneCardProps {
  village: Playthrough;
  lane: LaneSchedule;
  lanes: LaneSchedule[];
  conflicts: QueueConflict[];
  now: number;
  onAdd: (builderId: number) => void;
  onRemove: (item: BuilderQueueItem) => void;
  onMove: (itemId: string, builderId: number, index: number) => void;
  onStartNow: (builderId: number, item: BuilderQueueItem) => void;
}

export interface QueueTimelineProps {
  schedule: QueueSchedule;
  now: number;
  zoomDays: number;
  onZoomChange: (days: number) => void;
}

export interface AddUpgradeFlyoutProps {
  open: boolean;
  village: Playthrough;
  lanes: LaneSchedule[];
  initialLaneId: number | null;
  boostPercent: BoostPercent;
  hiddenCategories: string[];
  onHiddenCategoriesChange: (categories: string[]) => void;
  onAdd: (builderId: number, items: BuilderQueueItem[], label: string) => void;
  onClose: () => void;
}

export interface GroupCardProps {
  group: UpgradeGroup;
  boostPercent: BoostPercent;
  onAdd: (level: number, upTo: boolean) => void;
}
