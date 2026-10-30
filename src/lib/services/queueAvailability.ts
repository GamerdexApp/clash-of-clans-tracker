import type { Playthrough } from "@/types/app";
import type { AvailableGroup, ResearchAvailability, UpgradeGroup } from "@/types/app/available";
import type { LaneKind } from "@/types/app/engine";
import type { AnyQueueItem } from "@/types/app/queue";
import type { UpgradeStep } from "@/types/app/upgrade";

import { availableResearch, researchQueueItemFor } from "./availableResearch";
import { availableBBResearch, availableBBUpgrades, bbQueueItemFor } from "./availableBuilderBase";
import { availableUpgrades, queueItemFor } from "./availableUpgrades";

/** What the Add flyout of a queue lists. Only research and pets have items to unlock first. */
export const availableFor = (village: Playthrough, lane: LaneKind): ResearchAvailability => {
  if (lane === "builder") return { groups: availableUpgrades(village), locked: [] };
  if (lane === "bbBuilder") return { groups: availableBBUpgrades(village), locked: [] };
  if (lane === "bbResearch") return availableBBResearch(village);
  return availableResearch(village, lane === "pet");
};

export const queueItemForGroup = (lane: LaneKind, group: AvailableGroup, step: UpgradeStep): AnyQueueItem => {
  if (lane === "builder") return queueItemFor(group as UpgradeGroup, step);
  if (lane === "bbBuilder" || lane === "bbResearch") return bbQueueItemFor(group, step);
  return researchQueueItemFor(group, step);
};
