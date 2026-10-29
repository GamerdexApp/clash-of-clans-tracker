import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { builderBaseText } from "@/lib/messages/builderBase";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";

interface BuilderBaseActions {
  setBuilderHall: (level: number, options: { setDaysToToday: boolean }) => void;
}

const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).toISOString();

/** Changes the Builder Hall on the latest saved village. The change offers Undo. */
export const useBuilderBaseActions = (village: Playthrough): BuilderBaseActions => {
  const { updateData } = usePlaythrough();
  const showToast = useToast();

  return {
    setBuilderHall: (level, { setDaysToToday }) => {
      const from = village.data.builderBase.builderHallLevel;
      const now = new Date();
      const previous = updateData((data) => ({
        ...data,
        playthroughs: data.playthroughs.map((candidate) =>
          candidate.id === village.id
            ? {
                ...candidate,
                data: { ...candidate.data, builderBase: { ...candidate.data.builderBase, builderHallLevel: level } },
                ...(setDaysToToday ? { bhChangedAt: startOfUtcDay(now) } : {}),
                lastModified: now.toISOString(),
              }
            : candidate,
        ),
      }));
      if (!previous) return;
      showToast({
        variant: "success",
        title: builderBaseText.hall.toast(from, level),
        action: { label: builderBaseText.hall.undo, onAction: () => updateData(() => previous) },
      });
    },
  };
};
