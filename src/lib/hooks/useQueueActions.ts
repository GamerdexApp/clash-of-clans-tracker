import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { goldPassBoosts } from "@/service/goldPass";
import { queueText } from "@/lib/messages/queue";
import {
  addToQueue,
  moveQueueItem,
  removeFromQueue,
  startFromQueue,
  targetForItem,
} from "@/service/builderQueue";
import { targetName } from "@/service/upgradeLabels";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";
import type { BuilderQueueItem } from "@/types/app/queue";

interface QueueActions {
  add: (builderId: number, items: BuilderQueueItem[], label: string) => void;
  remove: (item: BuilderQueueItem) => void;
  move: (itemId: string, builderId: number, index: number) => void;
  startNow: (builderId: number, item: BuilderQueueItem) => void;
}

/** Applies each queue change to the latest stored village and offers Undo where something is removed. */
export const useQueueActions = (village: Playthrough): QueueActions => {
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
    add: (builderId, items, label) => {
      const previous = apply((current) => items.reduce((next, item) => addToQueue(next, builderId, item), current));
      if (!previous) return;
      showToast({ variant: "success", title: items.length === 1 ? `${label} added` : `${items.length} levels of ${label} added` });
    },

    remove: (item) => {
      const previous = apply((current) => removeFromQueue(current, item.id));
      if (!previous) return;
      showToast({
        variant: "success",
        title: queueText.lane.removed(targetName(targetForItem(item))),
        action: { label: queueText.lane.undo, onAction: () => updateData(() => previous) },
      });
    },

    move: (itemId, builderId, index) => {
      apply((current) => moveQueueItem(current, itemId, builderId, index));
    },

    startNow: (builderId, item) => {
      const previous = apply((current, now) =>
        startFromQueue(current, builderId, item.id, { boostPercent: goldPassBoosts(current, now).builder, now }),
      );
      if (!previous) return;
      showToast({ variant: "success", title: queueText.lane.started(targetName(targetForItem(item))) });
    },
  };
};
