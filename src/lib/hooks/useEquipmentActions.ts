import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { equipmentText } from "@/lib/messages/equipment";
import {
  equipmentLevel,
  setEquipmentLevel,
  setOreStock,
  upgradeEquipment,
} from "@/service/equipment";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";
import type { EquipmentPiece, OreAmounts } from "@/types/app/equipment";

interface EquipmentActions {
  deductOre: boolean;
  setDeductOre: (deduct: boolean) => void;
  upgrade: (heroName: string, piece: EquipmentPiece) => void;
  setLevel: (heroName: string, piece: EquipmentPiece, level: number) => void;
  setOre: (stock: OreAmounts) => void;
}

/** Changes the one piece, or the stock, on the latest saved village. Each level change offers Undo. */
export const useEquipmentActions = (village: Playthrough): EquipmentActions => {
  const { appSettings, updateData, updateSettings } = usePlaythrough();
  const showToast = useToast();
  const deductOre = appSettings.ui?.deductOre ?? true;

  const apply = (change: (current: Playthrough) => Playthrough) =>
    updateData((data) => ({
      ...data,
      playthroughs: data.playthroughs.map((candidate) =>
        candidate.id === village.id ? { ...change(candidate), lastModified: new Date().toISOString() } : candidate,
      ),
    }));

  const undoAction = (previous: NonNullable<ReturnType<typeof apply>>) => ({
    label: equipmentText.toast.undo,
    onAction: () => updateData(() => previous),
  });

  return {
    deductOre,
    setDeductOre: (deduct) => updateSettings({ ui: { ...appSettings.ui, deductOre: deduct } }),

    upgrade: (heroName, piece) => {
      const from = equipmentLevel(village, heroName, piece.name);
      const previous = apply((current) => upgradeEquipment(current, heroName, piece, { deduct: deductOre }));
      if (!previous) return;
      showToast({
        variant: "success",
        title: equipmentText.toast.upgraded(piece.name, from, from + 1),
        action: undoAction(previous),
      });
    },

    setLevel: (heroName, piece, level) => {
      const from = equipmentLevel(village, heroName, piece.name);
      const previous = apply((current) => setEquipmentLevel(current, heroName, piece.name, level));
      if (!previous) return;
      showToast({
        variant: "info",
        title: equipmentText.toast.levelSet(piece.name, from, level),
        action: undoAction(previous),
      });
    },

    setOre: (stock) => {
      apply((current) => setOreStock(current, stock));
    },
  };
};
