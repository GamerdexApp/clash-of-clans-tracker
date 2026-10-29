import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { goldPassBoosts } from "@/service/goldPass";
import { queueText } from "@/lib/messages/queue";
import {
  addToQueue,
  moveQueueItem,
  removeFromQueue,
  startFromQueue,
  targetForItem,
} from "@/service/upgradeQueue";
import { targetName } from "@/service/upgradeLabels";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";
import type { LaneKind } from "@/types/app/engine";
import type { AnyQueueItem } from "@/types/app/queue";

interface QueueActions {
  add: (laneId: number, items: AnyQueueItem[], label: string) => void;
  remove: (item: AnyQueueItem) => void;
  move: (itemId: string, laneId: number, index: number) => void;
  startNow: (laneId: number, item: AnyQueueItem) => void;
}

/** Applies each queue change to the latest stored village and offers Undo where something is removed. */
export const useQueueActions = (village: Playthrough, lane: LaneKind): QueueActions => {
  const { updateData } = usePlaythrough();
  const showToast = useToast();

  const apply = (change: (current: Playthrough, now: Date) => Playthrough) => {
    const now = new Date();
    return updateData((data) => ({
      ...data,
      playthroughs: data.playthroughs.map((candidate) =>
        candidate.id === village.id ? { ...change(candidate, now), lastModified: now.toISOString() } : candidate,
      ),
    }));
  };

  return {
    add: (laneId, items, label) => {
      const previous = apply((current) => items.reduce((next, item) => addToQueue(next, lane, laneId, item), current));
      if (!previous) return;
      showToast({ variant: "success", title: queueText.add.added(items.length, label) });
    },

    remove: (item) => {
      const previous = apply((current) => removeFromQueue(current, lane, item.id));
      if (!previous) return;
      showToast({
        variant: "success",
        title: queueText.lane.removed(targetName(targetForItem(item))),
        action: { label: queueText.lane.undo, onAction: () => updateData(() => previous) },
      });
    },

    move: (itemId, laneId, index) => {
      apply((current) => moveQueueItem(current, lane, itemId, laneId, index));
    },

    startNow: (laneId, item) => {
      const previous = apply((current, now) => {
        const boosts = goldPassBoosts(current, now);
        return startFromQueue(current, lane, laneId, item.id, {
          boostPercent: lane === "builder" ? boosts.builder : boosts.research,
          now,
        });
      });
      if (!previous) return;
      showToast({ variant: "success", title: queueText.lane.started(targetName(targetForItem(item))) });
    },
  };
};
