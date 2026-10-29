import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { wallsText } from "@/lib/messages/walls";
import { moveWalls, setWallCount, wallCount } from "@/service/walls";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";

interface WallActions {
  move: (from: number, to: number, count: number) => void;
  setCount: (level: number, count: number) => void;
}

/** Changes only the walls record on the latest saved village. Every change offers Undo. */
export const useWallActions = (village: Playthrough): WallActions => {
  const { updateData } = usePlaythrough();
  const showToast = useToast();

  const apply = (change: (current: Playthrough) => Playthrough) =>
    updateData((data) => ({
      ...data,
      playthroughs: data.playthroughs.map((candidate) =>
        candidate.id === village.id ? { ...change(candidate), lastModified: new Date().toISOString() } : candidate,
      ),
    }));

  const undoAction = (previous: NonNullable<ReturnType<typeof apply>>) => ({
    label: wallsText.toast.undo,
    onAction: () => updateData(() => previous),
  });

  return {
    move: (from, to, count) => {
      const moving = Math.min(count, wallCount(village, from));
      const previous = apply((current) => moveWalls(current, from, to, count));
      if (!previous || moving <= 0) return;
      showToast({ variant: "success", title: wallsText.toast.moved(moving, from, to), action: undoAction(previous) });
    },

    setCount: (level, count) => {
      const from = wallCount(village, level);
      const previous = apply((current) => setWallCount(current, level, count));
      if (!previous) return;
      const to = wallCount(setWallCount(village, level, count), level);
      showToast({ variant: "info", title: wallsText.toast.counted(level, from, to), action: undoAction(previous) });
    },
  };
};
