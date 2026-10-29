"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiArrowLeftLine, RiBarChartLine } from "react-icons/ri";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import {
  getPetSlots,
  getPetTimeline,
  isActiveUpgrade,
} from "@/lib/utils/upgradeHelpers";
import {
  getPetQueueConflicts,
  getAllResourceEvents,
} from "@/lib/utils/queueHelpers";
import {
  startPetUpgrade,
  finishPetUpgrade,
  cancelPetUpgrade,
  adjustPetUpgrade,
} from "@/lib/utils/upgradeActions";
import { QueueTimeline } from "@/components/upgrade/queue/QueueTimeline";
import { PetQueueCard } from "@/components/upgrade/queue/PetQueueCard";
import { AvailablePetUpgradesPanel } from "@/components/upgrade/queue/AvailableUpgradesPanel";
import { ResourcePlannerModal } from "@/components/upgrade/queue/ResourcePlannerModal";
import type { PetQueueItem } from "@/types/app/queue";
import type { PetActiveUpgrade } from "@/types/components/queue";

const PetsQueuePage = () => {
  const router = useRouter();
  const { activePlaythrough, appSettings, isLoaded, updatePlaythrough, updateSettings } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const [panelOpen, setPanelOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const slots = hv ? getPetSlots(hv) : [];
  const researchBoostPct = (activePlaythrough?.dailies?.goldPass.researchBoostPct ?? 0) as 0 | 10 | 15 | 20;
  const builderBoostPct = (activePlaythrough?.dailies?.goldPass.builderBoostPct ?? 0) as 0 | 10 | 15 | 20;

  const activeHours = appSettings.activeHours;

  const petTimelineBlocks = useMemo(() => (hv ? getPetTimeline(hv, 90, activeHours, researchBoostPct) : []), [hv, activeHours, researchBoostPct]);
  const timeline = useMemo<Record<string, import("@/types/app/queue").TimelineBlock[]>>(
    () => ({ "1": petTimelineBlocks }),
    [petTimelineBlocks]
  );

  const conflicts = useMemo(() => (hv ? getPetQueueConflicts(hv, activeHours) : []), [hv, activeHours]);
  const conflictItemIds = useMemo(() => new Set(conflicts.map((c) => c.queueItemId)), [conflicts]);

  const resourceGroups = useMemo(() => (hv ? getAllResourceEvents(hv, appSettings, builderBoostPct, researchBoostPct) : []), [hv, appSettings, builderBoostPct, researchBoostPct]);

  const saveHv = (newHv: NonNullable<typeof hv>) => {
    if (!activePlaythrough) return;
    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, homeVillage: newHv },
    });
  }

  let activeUpgrade: PetActiveUpgrade | undefined;
  if (hv) {
    for (const pet of hv.pets) {
      const u = (pet as any).upgrade;
      if (u && isActiveUpgrade(u.finishesAt)) {
        activeUpgrade = {
          label: `${pet.name} ${pet.level}→${pet.level + 1}`,
          finishesAt: u.finishesAt,
          level: pet.level,
          onFinish: () => saveHv(finishPetUpgrade(hv, pet.name)),
          onCancel: () => saveHv(cancelPetUpgrade(hv, pet.name)),
          onAdjust: (f) => saveHv(adjustPetUpgrade(hv, pet.name, f)),
        };
        break;
      }
    }
  }

  const handleQueueChange = (newQueue: PetQueueItem[]) => {
    if (!activePlaythrough || !hv) return;
    updatePlaythrough(activePlaythrough.id, {
      data: {
        ...activePlaythrough.data,
        homeVillage: { ...hv, petQueue: newQueue },
      },
    });
  };

  const handleAddItem = (item: PetQueueItem) => {
    const existing = hv?.petQueue ?? [];
    handleQueueChange([...existing, item]);
  };

  const handleStartFirst = (item: PetQueueItem) => {
    if (!hv) return;
    const step = {
      level: item.targetLevel,
      cost: item.cost,
      costResource: item.costResource,
      buildTime: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      durationMs: item.durationMs,
    };
    const newHv = startPetUpgrade(hv, item.name, step, slots[0]?.id ?? 1);
    const remaining = (hv.petQueue ?? []).filter((q) => q.id !== item.id);
    saveHv({ ...newHv, petQueue: remaining });
  };

  if (!activePlaythrough || !hv) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/upgrade/home/pets"
            className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <RiArrowLeftLine size={16} />
            Pets
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-[18px] font-extrabold text-gray-900">Queue</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setPlannerOpen(true)}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-primary/80 bg-primary/10 px-3 py-1.5 text-[12px] font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              <RiBarChartLine size={14} />
              Resource Planner
            </button>
            <button
              onClick={() => setPanelOpen(true)}
              className="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-[12px] font-bold text-primary hover:bg-accent/90 transition-colors"
            >
              + Add Pet
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {slots.length > 0 && (
          <QueueTimeline
            timeline={timeline}
            slots={slots}
            conflictItemIds={conflictItemIds}
            activeHours={activeHours}
            onActiveHoursChange={(h) => updateSettings({ activeHours: h })}
          />
        )}

        <div className="flex-1 p-4">
          {thLevel < 14 ? (
            <p className="py-8 text-center text-sm text-white/80">Pets unlock at TH14.</p>
          ) : (
            <PetQueueCard
              queue={hv.petQueue ?? []}
              activeUpgrade={activeUpgrade}
              isBusy={!!activeUpgrade}
              conflicts={conflicts}
              researchBoostPct={researchBoostPct}
              onQueueChange={handleQueueChange}
              onAddClick={() => setPanelOpen(true)}
              onStartFirst={handleStartFirst}
            />
          )}
        </div>
      </div>

      {panelOpen && (
        <AvailablePetUpgradesPanel
          hv={hv}
          researchBoostPct={researchBoostPct}
          onAdd={handleAddItem}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {plannerOpen && (
        <ResourcePlannerModal
          groups={resourceGroups}
          title="Pet Upgrade Planner"
          onClose={() => setPlannerOpen(false)}
        />
      )}
    </div>
  );
}
export default PetsQueuePage;
