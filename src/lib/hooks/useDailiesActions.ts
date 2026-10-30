import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { formatDuration } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import { markUsed, setResetTime, setResetTimeAndMarkUsed, withDailies, dailiesOf, type TimerKey } from "@/service/dailies";
import { clearSlot, forgeResource, startAutoForge, startSlot, stopAutoForge, type ForgeRate } from "@/service/forge";
import {
  acceptRollover,
  restoreRolledBoosts,
  setBoost,
  setPerk,
  setProspectorUnlocked,
  type GoldPassPerk,
} from "@/service/goldPass";
import { type AssigningHelper } from "@/service/helperAssignments";
import {
  assignUpgrade,
  assignmentView,
  setAssignmentMode,
  setHelperLevel,
  applyHelperUse,
  previewHelperUse,
  type HelperId,
} from "@/service/helpers";
import { targetName } from "@/service/upgradeLabels";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";
import type { BoostPercent, UpgradeTarget } from "@/types/app/engine";
import type { HelperAssignment } from "@/types/app/playthrough";

interface DailiesActions {
  setResetTime: (key: TimerKey, resetTime: string) => void;
  setResetTimeAndUse: (key: TimerKey, resetTime: string, name: string) => void;
  markTimerUsed: (key: TimerKey, name: string) => void;
  markHelperUsed: (helper: HelperId) => void;
  startSlot: (index: number, rate: ForgeRate) => void;
  stopSlot: (index: number) => void;
  resetSlot: (index: number) => void;
  startAuto: (rate: ForgeRate) => void;
  stopAuto: () => void;
  setBoost: (kind: "builder" | "research", boost: BoostPercent) => void;
  setPerk: (perk: GoldPassPerk, on: boolean) => void;
  setProspector: (unlocked: boolean) => void;
  acceptRollover: () => void;
  restoreRollover: () => void;
  setHelperLevel: (helper: AssigningHelper | "alchemist", level: number | undefined) => void;
  assign: (helper: AssigningHelper, target: UpgradeTarget | null) => void;
  setMode: (helper: AssigningHelper, mode: HelperAssignment["mode"]) => void;
  clearAssignment: (helper: AssigningHelper) => void;
}

const text = dailiesText;

/** Changes only the Dailies data on the latest saved village. Use, Stop, Reset, Clear assignment and the month reset offer Undo. */
export const useDailiesActions = (village: Playthrough): DailiesActions => {
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

  const withUndo = (
    change: (current: Playthrough, now: Date) => Playthrough,
    title: string,
    message?: string,
  ) => {
    const previous = apply(change);
    if (!previous) return;
    showToast({
      variant: "info",
      title,
      message,
      action: { label: text.timer.undo, onAction: () => updateData(() => previous) },
    });
  };

  return {
    setResetTime: (key, resetTime) => {
      apply((current) => withDailies(current, setResetTime(dailiesOf(current), key, resetTime)));
    },

    setResetTimeAndUse: (key, resetTime, name) =>
      withUndo((current, now) => withDailies(current, setResetTimeAndMarkUsed(dailiesOf(current), key, resetTime, now)), text.timer.used(name)),

    markTimerUsed: (key, name) =>
      withUndo((current, now) => withDailies(current, markUsed(dailiesOf(current), key, now)), text.timer.used(name)),

    markHelperUsed: (helper) => {
      const name = text.helpers.names[helper];
      const now = new Date();
      const isAssistant = helper === "buildersApprentice" || helper === "labAssistant";
      const view = isAssistant ? assignmentView(village, helper, now) : null;
      const preview = isAssistant ? previewHelperUse(village, helper, now) : null;
      const title =
        view && preview
          ? text.helpers.used.saved(name, targetName(view.target), formatDuration(preview.savedMs))
          : text.helpers.used.plain(name);
      withUndo((current, at) => applyHelperUse(current, helper, at), title);
    },

    startSlot: (index, rate) => {
      apply((current, now) => startSlot(current, index, rate, now));
    },

    stopSlot: (index) => withUndo((current) => clearSlot(current, index), text.forge.slots.stopped(index + 1)),

    resetSlot: (index) => {
      const resource = dailiesOf(village).forgeSlots[index]?.resourceType;
      withUndo(
        (current) => clearSlot(current, index),
        text.forge.slots.resetDone(index + 1, resource ? forgeResource(resource).label : ""),
      );
    },

    startAuto: (rate) => {
      apply((current, now) => startAutoForge(current, rate, now));
    },

    stopAuto: () => withUndo((current) => stopAutoForge(current), text.forge.auto.stopped),

    setBoost: (kind, boost) => {
      apply((current, now) => setBoost(current, kind, boost, now));
    },

    setPerk: (perk, on) => {
      apply((current) => setPerk(current, perk, on));
    },

    setProspector: (unlocked) => {
      apply((current) => setProspectorUnlocked(current, unlocked));
    },

    acceptRollover: () => {
      apply((current, now) => acceptRollover(current, now));
    },

    restoreRollover: () => {
      const previous = apply((current, now) => restoreRolledBoosts(current, now));
      if (!previous) return;
      showToast({
        variant: "success",
        title: text.seasonPass.month.restored,
        action: { label: text.timer.undo, onAction: () => updateData(() => previous) },
      });
    },

    setHelperLevel: (helper, level) => {
      apply((current) => setHelperLevel(current, helper, level));
    },

    assign: (helper, target) => {
      apply((current) => assignUpgrade(current, helper, target));
    },

    setMode: (helper, mode) => {
      apply((current) => setAssignmentMode(current, helper, mode));
    },

    clearAssignment: (helper) => withUndo((current) => assignUpgrade(current, helper, null), text.helpers.assignment.cleared),
  };
};
