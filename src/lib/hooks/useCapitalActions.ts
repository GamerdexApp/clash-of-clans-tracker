import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { capitalText } from "@/lib/messages/capital";
import {
  capitalHallOf,
  changeCapitalHall,
  changeZoneHall,
  setArmyLevel,
  setBuildingLevel,
  setContributions,
  setGroupLevels,
  setTracking,
  setWallCount,
  zoneHall,
  zoneLabel,
  type HallChange,
} from "@/service/capital";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";
import type { CapitalGroup, ZoneId } from "@/types/app/capital";
import type { BuildingEditData } from "@/lib/utils/massEditHelpers";

interface CapitalActions {
  setTracking: (tracking: boolean) => void;
  setContributions: (amount: number) => void;
  /** What a hall change would reset, without writing anything. */
  previewHall: (zoneId: ZoneId, level: number) => HallChange;
  changeHall: (zoneId: ZoneId, level: number) => void;
  setBuilding: (zoneId: ZoneId, building: BuildingEditData, instanceIndex: number, level: number) => void;
  setGroup: (zoneId: ZoneId, group: CapitalGroup, buildings: BuildingEditData[], to: "max" | "clear") => void;
  setWall: (zoneId: ZoneId, level: number, count: number) => void;
  setArmy: (kind: "troops" | "spells", name: string, level: number) => void;
}

/** Changes only the Clan Capital data on the latest saved village. Hall changes and tracking offer Undo. */
export const useCapitalActions = (village: Playthrough): CapitalActions => {
  const { updateData } = usePlaythrough();
  const showToast = useToast();
  const text = capitalText;

  const apply = (change: (current: Playthrough) => Playthrough) =>
    updateData((data) => ({
      ...data,
      playthroughs: data.playthroughs.map((candidate) =>
        candidate.id === village.id ? { ...change(candidate), lastModified: new Date().toISOString() } : candidate,
      ),
    }));

  const undoAction = (previous: NonNullable<ReturnType<typeof apply>>) => ({
    label: text.toast.undo,
    onAction: () => updateData(() => previous),
  });

  const preview = (zoneId: ZoneId, level: number) =>
    zoneId === "capitalPeak" ? changeCapitalHall(village, level) : changeZoneHall(village, zoneId, level);

  return {
    setTracking: (tracking) => {
      const previous = apply((current) => setTracking(current, tracking));
      if (!previous || !tracking) return;
      showToast({ variant: "success", title: text.tracking.turnedOn, action: undoAction(previous) });
    },

    setContributions: (amount) => {
      apply((current) => setContributions(current, amount));
    },

    previewHall: preview,

    changeHall: (zoneId, level) => {
      const from = zoneId === "capitalPeak" ? capitalHallOf(village) : zoneHall(village, zoneId);
      const previous = apply((current) =>
        zoneId === "capitalPeak" ? changeCapitalHall(current, level).village : changeZoneHall(current, zoneId, level).village,
      );
      if (!previous) return;
      const raised = level > from;
      const title =
        zoneId === "capitalPeak"
          ? raised
            ? text.hall.raised(from, level)
            : text.hall.changed(from, level)
          : raised
            ? text.hall.districtRaised(zoneLabel(zoneId), from, level)
            : text.hall.districtChanged(zoneLabel(zoneId), from, level);
      showToast({ variant: "info", title, action: undoAction(previous) });
    },

    setBuilding: (zoneId, building, instanceIndex, level) => {
      apply((current) => setBuildingLevel(current, zoneId, building, instanceIndex, level));
    },

    setGroup: (zoneId, group, buildings, to) => {
      const previous = apply((current) => setGroupLevels(current, zoneId, buildings, to));
      if (!previous) return;
      const name = text.panel.groups[group];
      showToast({
        variant: "info",
        title: to === "max" ? text.panel.groupMaxed(zoneLabel(zoneId), name) : text.panel.groupCleared(zoneLabel(zoneId), name),
        action: undoAction(previous),
      });
    },

    setWall: (zoneId, level, count) => {
      apply((current) => setWallCount(current, zoneId, level, count));
    },

    setArmy: (kind, name, level) => {
      apply((current) => setArmyLevel(current, kind, name, level));
    },
  };
};
