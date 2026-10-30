import type { Playthrough } from "@/types/app";
import type { AvailableGroup } from "@/types/app/available";
import type { BoostPercent, LaneKind } from "@/types/app/engine";
import type { AnyQueueItem } from "@/types/app/queue";
import type { LaneSchedule, QueueConflict, QueueSchedule } from "@/types/app/queueEngine";

export interface LaneCardProps {
  lane: LaneKind;
  village: Playthrough;
  schedule: LaneSchedule;
  lanes: LaneSchedule[];
  conflicts: QueueConflict[];
  now: number;
  onAdd: (laneId: number) => void;
  onRemove: (item: AnyQueueItem) => void;
  onMove: (itemId: string, laneId: number, index: number) => void;
  onStartNow: (laneId: number, item: AnyQueueItem) => void;
}

export interface QueueTimelineProps {
  schedule: QueueSchedule;
  now: number;
  zoomDays: number;
  onZoomChange: (days: number) => void;
}

export interface AddUpgradeFlyoutProps {
  open: boolean;
  lane: LaneKind;
  village: Playthrough;
  lanes: LaneSchedule[];
  initialLaneId: number | null;
  boostPercent: BoostPercent;
  hiddenCategories: string[];
  onHiddenCategoriesChange: (categories: string[]) => void;
  onAdd: (laneId: number, items: AnyQueueItem[], label: string) => void;
  onUnlock: (group: AvailableGroup) => void;
  onClose: () => void;
}

export interface GroupCardProps {
  lane: LaneKind;
  group: AvailableGroup;
  boostPercent: BoostPercent;
  onAdd: (level: number, upTo: boolean) => void;
}
