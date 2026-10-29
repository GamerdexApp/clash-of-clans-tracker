import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { formatNumber } from "@/lib/format";
import { achievementsText } from "@/lib/messages/achievements";
import { editAchievement, targetForStars, type AchievementEdit, type AchievementVillage } from "@/service/achievements";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";
import type { TrackedAchievement } from "@/types/app/game";

interface AchievementActions {
  edit: (current: TrackedAchievement, edit: AchievementEdit) => void;
}

const text = achievementsText.toast;

/** Changes one achievement on the latest saved village and offers Undo for the star, value and target edits. */
export const useAchievementActions = (village: Playthrough): AchievementActions => {
  const { updateData } = usePlaythrough();
  const showToast = useToast();

  return {
    edit: (current, edit) => {
      const area = current.village as AchievementVillage;
      const previous = updateData((data) => ({
        ...data,
        playthroughs: data.playthroughs.map((candidate) =>
          candidate.id === village.id
            ? { ...editAchievement(candidate, current.name, area, edit), lastModified: new Date().toISOString() }
            : candidate,
        ),
      }));
      if (!previous || edit.manual !== undefined && Object.keys(edit).length === 1) return;

      const movedTarget = edit.stars !== undefined && edit.stars !== current.stars ? targetForStars(current.name, edit.stars) : null;
      const title =
        edit.stars !== undefined
          ? text.stars(current.name, Math.min(3, edit.stars))
          : edit.value !== undefined
            ? text.value(current.name, formatNumber(edit.value))
            : text.target(current.name, formatNumber(edit.target ?? 0));
      showToast({
        variant: "info",
        title,
        message: movedTarget ? text.targetMoved(formatNumber(movedTarget)) : undefined,
        action: { label: text.undo, onAction: () => updateData(() => previous) },
      });
    },
  };
};
