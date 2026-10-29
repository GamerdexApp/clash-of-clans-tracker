"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiArrowLeftLine, RiBarChartLine } from "react-icons/ri";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import {
  getResearchSlots,
  getResearchTimeline,
  getResearchUpgradeSteps,
} from "@/lib/utils/upgradeHelpers";
import {
  getResearchQueueConflicts,
  getAllResourceEvents,
} from "@/lib/utils/queueHelpers";
import {
  startResearchUpgrade,
  finishResearchUpgrade,
  cancelResearchUpgrade,
  adjustResearchUpgrade,
} from "@/lib/utils/upgradeActions";
import { QueueTimeline } from "@/components/upgrade/queue/QueueTimeline";
import { ResearchQueueCard } from "@/components/upgrade/queue/ResearchQueueCard";
import { AvailableResearchUpgradesPanel } from "@/components/upgrade/queue/AvailableUpgradesPanel";
import { ResourcePlannerModal } from "@/components/upgrade/queue/ResourcePlannerModal";
import type { ResearchQueueItem } from "@/types/app/queue";
import type { ResearchKey } from "@/types/app/game";

const ResearchQueuePage = () => {
  const router = useRouter();
  const { activePlaythrough, appSettings, isLoaded, updatePlaythrough, updateSettings } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const [panelSlotId, setPanelSlotId] = useState<number | undefined>(undefined);
  const [panelOpen, setPanelOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const slots = hv ? getResearchSlots(hv, appSettings.goblinResearchEnabled) : [];
  const researchBoostPct = (activePlaythrough?.dailies?.goldPass.researchBoostPct ?? 0) as 0 | 10 | 15 | 20;
  const builderBoostPct = (activePlaythrough?.dailies?.goldPass.builderBoostPct ?? 0) as 0 | 10 | 15 | 20;

  const activeHours = appSettings.activeHours;

  const timeline = useMemo(
    () => (hv ? getResearchTimeline(hv, slots, 90, activeHours, researchBoostPct) : {}),
    [hv, slots, activeHours, researchBoostPct]
  );

  const conflicts = useMemo(
    () => (hv ? getResearchQueueConflicts(hv, slots, activeHours) : []),
    [hv, slots, activeHours]
  );

  const conflictItemIds = useMemo(
    () => new Set(conflicts.map((c) => c.queueItemId)),
    [conflicts]
  );

  const resourceGroups = useMemo(
    () => (hv ? getAllResourceEvents(hv, appSettings, builderBoostPct, researchBoostPct) : []),
    [hv, appSettings, builderBoostPct, researchBoostPct]
  );

  const activeBySlot = useMemo(() => {
    const map = new Map<number, {
      label: string;
      imageUrl: string;
      finishesAt: string;
      level: number;
      onFinish: () => void;
      onCancel: () => void;
      onAdjust: (f: string) => void;
    }>();
    if (!hv) return map;
    const entries: Array<[typeof hv.troops[number], ResearchKey]> = [
      ...hv.troops.map((t): [typeof t, ResearchKey] => [t, "troops"]),
      ...hv.spells.map((t): [typeof t, ResearchKey] => [t, "spells"]),
      ...hv.siegeMachines.map((t): [typeof t, ResearchKey] => [t, "siegeMachines"]),
    ];
    for (const [item, key] of entries) {
      const u = (item as any).upgrade;
      if (u) {
        const imageUrl = getResearchUpgradeSteps(item.name, item.level, thLevel)[0]?.imageUrl ?? "";
        map.set(u.builderId, {
          label: `${item.name} ${item.level}→${item.level + 1}`,
          imageUrl,
          finishesAt: u.finishesAt,
          level: item.level,
          onFinish: () => saveHv(finishResearchUpgrade(hv, key, item.name)),
          onCancel: () => saveHv(cancelResearchUpgrade(hv, key, item.name)),
          onAdjust: (f) => saveHv(adjustResearchUpgrade(hv, key, item.name, f)),
        });
      }
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hv]);

  const saveHv = (newHv: NonNullable<typeof hv>)=> {
    if (!activePlaythrough) return;
    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, homeVillage: newHv },
    });
  }

  const saveQueues = (newQueues: Record<string, ResearchQueueItem[]>)=> {
    if (!activePlaythrough || !hv) return;
    updatePlaythrough(activePlaythrough.id, {
      data: {
        ...activePlaythrough.data,
        homeVillage: { ...hv, researchQueue: newQueues },
      },
    });
  }

  const handleQueueChange = (slotId: number, newQueue: ResearchQueueItem[])=> {
    const current = hv?.researchQueue ?? {};
    saveQueues({ ...current, [String(slotId)]: newQueue });
  }

  const handleStartFirst = (item: ResearchQueueItem, slotId: number)=> {
    if (!hv) return;
    const step = {
      level: item.targetLevel,
      cost: item.cost,
      costResource: item.costResource,
      buildTime: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      durationMs: item.durationMs,
    };
    const newHv = startResearchUpgrade(hv, item.category, item.name, step, slotId);
    const current = hv.researchQueue ?? {};
    const queue = current[String(slotId)] ?? [];
    saveHv({ ...newHv, researchQueue: { ...current, [String(slotId)]: queue.filter((q) => q.id !== item.id) } });
  }

  const handleAddItem = (item: ResearchQueueItem, slotId: number)=> {
    const current = hv?.researchQueue ?? {};
    const existing = current[String(slotId)] ?? [];
    saveQueues({ ...current, [String(slotId)]: [...existing, item] });
  }

  const handleUnlock = (name: string, category: "troops" | "spells" | "siegeMachines")=> {
    if (!activePlaythrough || !hv) return;
    const key = category as "troops" | "spells" | "siegeMachines";
    const existing = hv[key] as { name: string; level: number }[];
    const updated = existing.some((t) => t.name === name)
      ? existing.map((t) => (t.name === name ? { ...t, level: 1 } : t))
      : [...existing, { name, level: 1 }];
    updatePlaythrough(activePlaythrough.id, {
      data: {
        ...activePlaythrough.data,
        homeVillage: { ...hv, [key]: updated },
      },
    });
  }

  if (!activePlaythrough || !hv) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/upgrade/home/research"
            className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <RiArrowLeftLine size={16} />
            Research
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
              onClick={() => { setPanelSlotId(undefined); setPanelOpen(true); }}
              className="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-[12px] font-bold text-primary hover:bg-accent/90 transition-colors"
            >
              + Add Research
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        <QueueTimeline
          timeline={timeline}
          slots={slots}
          conflictItemIds={conflictItemIds}
          activeHours={activeHours}
          onActiveHoursChange={(h) => updateSettings({ activeHours: h })}
        />

        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {slots.map((slot) => (
              <ResearchQueueCard
                key={slot.id}
                slot={slot}
                queue={hv.researchQueue?.[String(slot.id)] ?? []}
                activeUpgrade={activeBySlot.get(slot.id)}
                conflicts={conflicts.filter((c) =>
                  (hv.researchQueue?.[String(slot.id)] ?? []).some((i) => i.id === c.queueItemId)
                )}
                researchBoostPct={researchBoostPct}
                onQueueChange={(q) => handleQueueChange(slot.id, q)}
                onAddClick={(id) => { setPanelSlotId(id); setPanelOpen(true); }}
                onStartFirst={(item) => handleStartFirst(item, slot.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {panelOpen && (
        <AvailableResearchUpgradesPanel
          hv={hv}
          slots={slots}
          targetSlotId={panelSlotId}
          researchBoostPct={researchBoostPct}
          onAdd={handleAddItem}
          onUnlock={handleUnlock}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {plannerOpen && (
        <ResourcePlannerModal
          groups={resourceGroups}
          title="Research Planner"
          onClose={() => setPlannerOpen(false)}
        />
      )}
    </div>
  );
}
export default ResearchQueuePage;
