import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { goldPassBoosts } from "@/service/goldPass";
import {
  cancelUpgrade,
  finishUpgrade,
  laneKindOf,
  readLevel,
  setLevel,
  startUpgrade,
} from "@/service/upgradeEngine";
import { targetName } from "@/service/upgradeLabels";
import { useToast } from "@/comps/ui/Toast";
import { formatDuration } from "@/lib/format";
import type { Playthrough } from "@/types/app";
import type { BoostPercent, FinishMethod, UpgradeTarget } from "@/types/app/engine";
import type { UpgradeStep } from "@/types/app/upgrade";

/** Research and pet upgrades use the research boost. The Builder Base has no boost. */
const boostFor = (target: UpgradeTarget, boosts: ReturnType<typeof goldPassBoosts>): BoostPercent => {
  const lane = laneKindOf(target);
  if (lane === "builder") return boosts.builder;
  return lane === "bbBuilder" || lane === "bbResearch" ? 0 : boosts.research;
};

interface UpgradeActions {
  goblinBuilderEnabled: boolean;
  goblinResearchEnabled: boolean;
  start: (target: UpgradeTarget, step: UpgradeStep, builderId: number) => void;
  finish: (target: UpgradeTarget, method: FinishMethod) => void;
  cancel: (target: UpgradeTarget, fromLevel: number) => void;
  changeLevel: (target: UpgradeTarget, level: number) => void;
}

/** Applies each change to the latest stored village, stamps `lastModified` and shows the toast. */
export const useUpgradeActions = (village: Playthrough): UpgradeActions => {
  const { appSettings, updateData } = usePlaythrough();
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
  const undoAction = (previous: NonNullable<ReturnType<typeof apply>>) => ({
    label: "Undo",
    onAction: () => updateData(() => previous),
  });

  return {
    goblinBuilderEnabled: appSettings.goblinBuilderEnabled,
    goblinResearchEnabled: appSettings.goblinResearchEnabled,

    start: (target, step, builderId) => {
      const fromLevel = readLevel(village, target);
      const previous = apply((current, now) => startUpgrade(current, target, step, builderId, { boostPercent: boostFor(target, goldPassBoosts(current, now)), now }));
      if (!previous) return;
      showToast({
        variant: "success",
        title: `${targetName(target)} Lv ${fromLevel} to ${step.level} started`,
      });
    },

    finish: (target, method) => {
      const fromLevel = readLevel(village, target);
      let savedMs = 0;
      const previous = apply((current, now) => {
        const result = finishUpgrade(current, target, method, now);
        savedMs = result.timeSavedMs;
        return result.village;
      });
      if (!previous) return;
      showToast({
        variant: "success",
        title: `${targetName(target)} finished at Lv ${fromLevel + 1}`,
        message: savedMs > 0 ? `${formatDuration(savedMs)} added to time saved.` : undefined,
        action: undoAction(previous),
      });
    },

    cancel: (target, fromLevel) => {
      const previous = apply((current) => cancelUpgrade(current, target));
      if (!previous) return;
      showToast({
        variant: "success",
        title: `Cancelled ${targetName(target)} Lv ${fromLevel} to ${fromLevel + 1}`,
        action: undoAction(previous),
      });
    },

    changeLevel: (target, level) => {
      const fromLevel = readLevel(village, target);
      const previous = apply((current, now) => setLevel(current, target, level, now));
      if (!previous) return;
      showToast({
        variant: "info",
        title: `${targetName(target)} Lv ${fromLevel} to ${level}`,
        action: undoAction(previous),
      });
    },
  };
};
