import type { Playthrough } from "@/types/app";
import type { AvailableGroup, ResearchAvailability, UpgradeGroup } from "@/types/app/available";
import type { LaneKind } from "@/types/app/engine";
import type { AnyQueueItem } from "@/types/app/queue";
import type { UpgradeStep } from "@/types/app/upgrade";

import { availableResearch, researchQueueItemFor } from "./availableResearch";
import { availableUpgrades, queueItemFor } from "./availableUpgrades";

/** What the Add flyout of a queue lists. Only research and pets have items to unlock first. */
export const availableFor = (village: Playthrough, lane: LaneKind): ResearchAvailability =>
  lane === "builder"
    ? { groups: availableUpgrades(village), locked: [] }
    : availableResearch(village, lane === "pet");

export const queueItemForGroup = (lane: LaneKind, group: AvailableGroup, step: UpgradeStep): AnyQueueItem =>
  lane === "builder" ? queueItemFor(group as UpgradeGroup, step) : researchQueueItemFor(group, step);
