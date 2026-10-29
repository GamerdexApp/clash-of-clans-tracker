"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiArrowLeftLine, RiBarChartLine } from "react-icons/ri";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import {
  getBuilderSlots,
  getBuilderTimeline,
  formatFullNumber,
  getBuildingUpgradeSteps,
  getHeroUpgradeSteps,
  getTownHallImageUrl,
  getTownHallWeaponUpgradeSteps,
  getCraftedDefenseUpgradeSteps,
  getCraftedDefenseName,
  getCraftedDefenseModuleName,
  getCraftedDefenseImageUrl,
} from "@/lib/utils/upgradeHelpers";
import {
  getHeroesAtTH,
  getDefensesAtTH,
  getArmyBuildingsAtTH,
  getResourceBuildingsAtTH,
  getTrapsAtTH,
} from "@/lib/utils/massEditHelpers";
import {
  getBuilderQueueConflicts,
  getAllResourceEvents,
} from "@/lib/utils/queueHelpers";
import {
  startBuildingUpgrade,
  finishBuildingUpgrade,
  cancelBuildingUpgrade,
  adjustBuildingUpgrade,
  startHeroUpgrade,
  finishHeroUpgrade,
  cancelHeroUpgrade,
  adjustHeroUpgrade,
  startTownHallUpgrade,
  finishTownHallUpgrade,
  cancelTownHallUpgrade,
  adjustTownHallUpgrade,
  startTownHallWeaponUpgrade,
  finishTownHallWeaponUpgrade,
  cancelTownHallWeaponUpgrade,
  adjustTownHallWeaponUpgrade,
  startCraftedDefenseUpgrade,
  finishCraftedDefenseUpgrade,
  cancelCraftedDefenseUpgrade,
  adjustCraftedDefenseUpgrade,
} from "@/lib/utils/upgradeActions";
import { QueueTimeline } from "@/components/upgrade/queue/QueueTimeline";
import { BuilderQueueCard } from "@/components/upgrade/queue/BuilderQueueCard";
import { QueueItemOverlay } from "@/components/upgrade/queue/QueueItem";
import { AvailableBuilderUpgradesPanel } from "@/components/upgrade/queue/AvailableUpgradesPanel";
import { ResourcePlannerModal } from "@/components/upgrade/queue/ResourcePlannerModal";
import type { BuilderQueueItem } from "@/types/app/queue";
import type { BuildingRecordKey } from "@/types/app/game";
import type { UpgradeStep } from "@/types/app/upgrade";
import type { ActiveUpgradeForSlot } from "@/types/components/queue";

const BuilderQueuePage = () => {
  const router = useRouter();
  const { activePlaythrough, appSettings, isLoaded, updatePlaythrough, updateSettings } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const [panelSlotId, setPanelSlotId] = useState<number | undefined>(undefined);
  const [panelOpen, setPanelOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [draggingItem, setDraggingItem] = useState<BuilderQueueItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const slots = hv ? getBuilderSlots(hv, appSettings.goblinBuilderEnabled) : [];
  const builderBoostPct = (activePlaythrough?.dailies?.goldPass.builderBoostPct ?? 0) as 0 | 10 | 15 | 20;
  const researchBoostPct = (activePlaythrough?.dailies?.goldPass.researchBoostPct ?? 0) as 0 | 10 | 15 | 20;

  const activeHours = appSettings.activeHours;

  const timeline = useMemo(
    () => (hv ? getBuilderTimeline(hv, slots, 90, activeHours, builderBoostPct) : {}),
    [hv, slots, activeHours, builderBoostPct]
  );

  const conflicts = useMemo(
    () => (hv ? getBuilderQueueConflicts(hv, slots, activeHours) : []),
    [hv, slots, activeHours]
  );

  const conflictItemIds = useMemo(
    () => new Set(conflicts.map((c) => c.queueItemId)),
    [conflicts]
  );

  const multiInstanceBuildingIds = useMemo(() => {
    if (!hv) return new Set<string>();
    const multi = new Set<string>();
    for (const record of [hv.defenses, hv.armyBuildings, hv.resourceBuildings, hv.traps] as Array<Record<string, unknown[]>>) {
      for (const [id, instances] of Object.entries(record)) {
        if (instances.length > 1) multi.add(id);
      }
    }
    return multi;
  }, [hv]);

  const resourceGroups = useMemo(
    () => (hv ? getAllResourceEvents(hv, appSettings, builderBoostPct, researchBoostPct) : []),
    [hv, appSettings, builderBoostPct, researchBoostPct]
  );

  // Build a map of builderId → active upgrade info + action callbacks for display in cards
  const activeBySlot = useMemo<Map<number, ActiveUpgradeForSlot>>(() => {
    const map = new Map<number, ActiveUpgradeForSlot>();
    if (!hv) return map;

    const heroIdMap = new Map(getHeroesAtTH(thLevel).map((h) => [h.name, h.id]));
    const buildingNameMap = new Map<string, string>(
      [
        ...getDefensesAtTH(thLevel),
        ...getArmyBuildingsAtTH(thLevel),
        ...getResourceBuildingsAtTH(thLevel),
        ...getTrapsAtTH(thLevel),
      ].map((b) => [b.id, b.name])
    );

    const checkRecord = (recordKey: BuildingRecordKey) => {
      const record = hv[recordKey] as Record<string, Array<{ level: number; upgrade?: { finishesAt: string; builderId: number } }>>;
      for (const [id, instances] of Object.entries(record)) {
        instances.forEach((inst, idx) => {
          if (inst.upgrade) {
            const instanceLabel = instances.length > 1 ? ` #${idx + 1}` : "";
            const imageUrl = getBuildingUpgradeSteps(id, inst.level, thLevel, idx)[0]?.imageUrl ?? "";
            const displayName = buildingNameMap.get(id) ?? id;
            map.set(inst.upgrade.builderId, {
              label: `${displayName}${instanceLabel} ${inst.level}→${inst.level + 1}`,
              imageUrl,
              finishesAt: inst.upgrade.finishesAt,
              level: inst.level,
              onFinish: () => saveHv(finishBuildingUpgrade(hv, recordKey, id, idx)),
              onCancel: () => saveHv(cancelBuildingUpgrade(hv, recordKey, id, idx)),
              onAdjust: (f) => saveHv(adjustBuildingUpgrade(hv, recordKey, id, idx, f)),
            });
          }
        });
      }
    };

    checkRecord("defenses");
    checkRecord("armyBuildings");
    checkRecord("resourceBuildings");
    checkRecord("traps");

    for (const hero of hv.heroes) {
      if (hero.upgrade) {
        const heroId = heroIdMap.get(hero.name) ?? hero.name.toLowerCase().replace(/ /g, "-");
        const imageUrl = getHeroUpgradeSteps(heroId, hero.level, thLevel)[0]?.imageUrl ?? "";
        map.set(hero.upgrade.builderId, {
          label: `${hero.name} ${hero.level}→${hero.level + 1}`,
          imageUrl,
          finishesAt: hero.upgrade.finishesAt,
          level: hero.level,
          onFinish: () => saveHv(finishHeroUpgrade(hv, hero.name)),
          onCancel: () => saveHv(cancelHeroUpgrade(hv, hero.name)),
          onAdjust: (f) => saveHv(adjustHeroUpgrade(hv, hero.name, f)),
        });
      }
    }

    if (hv.townHallUpgrade) {
      map.set(hv.townHallUpgrade.builderId, {
        label: `Town Hall ${hv.townHallLevel}→${hv.townHallLevel + 1}`,
        imageUrl: getTownHallImageUrl(hv.townHallLevel + 1),
        finishesAt: hv.townHallUpgrade.finishesAt,
        level: hv.townHallLevel,
        onFinish: () => saveHv(finishTownHallUpgrade(hv)),
        onCancel: () => saveHv(cancelTownHallUpgrade(hv)),
        onAdjust: (f) => saveHv(adjustTownHallUpgrade(hv, f)),
      });
    }

    if (hv.townHallWeaponUpgrade) {
      const wl = hv.townHallWeaponLevel ?? 1;
      const imageUrl = getTownHallWeaponUpgradeSteps(thLevel, wl)[0]?.imageUrl ?? "";
      map.set(hv.townHallWeaponUpgrade.builderId, {
        label: `TH Weapon ${wl}→${wl + 1}`,
        imageUrl,
        finishesAt: hv.townHallWeaponUpgrade.finishesAt,
        level: wl,
        onFinish: () => saveHv(finishTownHallWeaponUpgrade(hv)),
        onCancel: () => saveHv(cancelTownHallWeaponUpgrade(hv)),
        onAdjust: (f) => saveHv(adjustTownHallWeaponUpgrade(hv, f)),
      });
    }

    for (const [defenseId, cd] of Object.entries(hv.craftedDefenses ?? {})) {
      if (!cd.moduleUpgrades) continue;
      cd.moduleUpgrades.forEach((u, moduleIndex) => {
        if (!u) return;
        const defName = getCraftedDefenseName(defenseId);
        const modName = getCraftedDefenseModuleName(defenseId, moduleIndex);
        const currentLevel = cd.modules[moduleIndex] ?? 0;
        const imageUrl = getCraftedDefenseUpgradeSteps(defenseId, moduleIndex, currentLevel)[0]?.imageUrl ?? getCraftedDefenseImageUrl(defenseId);
        map.set(u.builderId, {
          label: `${defName} ${modName} ${currentLevel}→${currentLevel + 1}`,
          imageUrl,
          finishesAt: u.finishesAt,
          level: currentLevel,
          onFinish: () => saveHv(finishCraftedDefenseUpgrade(hv, defenseId, moduleIndex)),
          onCancel: () => saveHv(cancelCraftedDefenseUpgrade(hv, defenseId, moduleIndex)),
          onAdjust: (f) => saveHv(adjustCraftedDefenseUpgrade(hv, defenseId, moduleIndex, f)),
        });
      });
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

  const saveQueues = (newQueues: Record<string, BuilderQueueItem[]>)=> {
    if (!activePlaythrough || !hv) return;
    updatePlaythrough(activePlaythrough.id, {
      data: {
        ...activePlaythrough.data,
        homeVillage: { ...hv, builderQueues: newQueues },
      },
    });
  }

  const handleQueueChange = (slotId: number, newQueue: BuilderQueueItem[])=> {
    const current = hv?.builderQueues ?? {};
    saveQueues({ ...current, [String(slotId)]: newQueue });
  }

  const handleStartFirst = (item: BuilderQueueItem, slotId: number)=> {
    if (!hv) return;
    const step: UpgradeStep = {
      level: item.targetLevel,
      cost: item.cost,
      costResource: item.costResource,
      buildTime: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      durationMs: item.durationMs,
    };
    let newHv: typeof hv;
    if (item.category === "heroes") {
      newHv = startHeroUpgrade(hv, item.name, step, slotId);
    } else if (item.buildingId === "town-hall") {
      newHv = startTownHallUpgrade(hv, step, slotId);
    } else if (item.buildingId === "town-hall-weapon") {
      newHv = startTownHallWeaponUpgrade(hv, step, slotId);
    } else if (item.category === "craftedDefenses") {
      newHv = startCraftedDefenseUpgrade(hv, item.buildingId, item.instanceIndex, step, slotId);
    } else {
      newHv = startBuildingUpgrade(hv, item.category as "defenses" | "armyBuildings" | "resourceBuildings" | "traps", item.buildingId, item.instanceIndex, step, slotId);
    }
    // Instant upgrades (0ms) complete immediately — finish right away so the level is applied
    if (item.durationMs === 0) {
      if (item.category === "heroes") {
        newHv = finishHeroUpgrade(newHv, item.name);
      } else if (item.buildingId === "town-hall") {
        newHv = finishTownHallUpgrade(newHv);
      } else if (item.buildingId === "town-hall-weapon") {
        newHv = finishTownHallWeaponUpgrade(newHv);
      } else if (item.category === "craftedDefenses") {
        newHv = finishCraftedDefenseUpgrade(newHv, item.buildingId, item.instanceIndex);
      } else {
        newHv = finishBuildingUpgrade(newHv, item.category as "defenses" | "armyBuildings" | "resourceBuildings" | "traps", item.buildingId, item.instanceIndex);
      }
    }
    // Remove the started item from the queue
    const current = hv.builderQueues ?? {};
    const queue = current[String(slotId)] ?? [];
    saveHv({ ...newHv, builderQueues: { ...current, [String(slotId)]: queue.filter((q) => q.id !== item.id) } });
  }

  const handleDragStart = (event: DragStartEvent)=> {
    const allItems = Object.values(hv?.builderQueues ?? {}).flat() as BuilderQueueItem[];
    setDraggingItem(allItems.find((i) => i.id === event.active.id) ?? null);
  }

  const handleDragEnd = (event: DragEndEvent)=> {
    setDraggingItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const itemToSlot = new Map<string, number>();
    for (const slot of slots) {
      for (const item of hv?.builderQueues?.[String(slot.id)] ?? []) {
        itemToSlot.set(item.id, slot.id);
      }
    }

    const sourceSlotId = itemToSlot.get(String(active.id));
    if (sourceSlotId === undefined) return;

    const overId = String(over.id);
    const isContainerDrop = overId.startsWith("container-");
    const targetSlotId = isContainerDrop
      ? parseInt(overId.replace("container-", ""))
      : (itemToSlot.get(overId) ?? sourceSlotId);

    const sourceQueue = [...(hv?.builderQueues?.[String(sourceSlotId)] ?? [])];
    const draggedItem = sourceQueue.find((i) => i.id === active.id);
    if (!draggedItem) return;

    if (sourceSlotId === targetSlotId && !isContainerDrop) {
      const oldIdx = sourceQueue.findIndex((i) => i.id === active.id);
      const newIdx = sourceQueue.findIndex((i) => i.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        saveQueues({ ...(hv?.builderQueues ?? {}), [String(sourceSlotId)]: arrayMove(sourceQueue, oldIdx, newIdx) });
      }
      return;
    }

    const targetQueue = [...(hv?.builderQueues?.[String(targetSlotId)] ?? [])];
    const newSource = sourceQueue.filter((i) => i.id !== active.id);
    if (isContainerDrop) {
      targetQueue.push(draggedItem);
    } else {
      const overIdx = targetQueue.findIndex((i) => i.id === over.id);
      targetQueue.splice(overIdx === -1 ? targetQueue.length : overIdx, 0, draggedItem);
    }

    saveQueues({
      ...(hv?.builderQueues ?? {}),
      [String(sourceSlotId)]: newSource,
      [String(targetSlotId)]: targetQueue,
    });
  }

  const handleAddItem = (item: BuilderQueueItem, slotId: number)=> {
    const current = hv?.builderQueues ?? {};
    const existing = current[String(slotId)] ?? [];
    saveQueues({ ...current, [String(slotId)]: [...existing, item] });
  }

  const openPanel = (slotId?: number)=> {
    setPanelSlotId(slotId);
    setPanelOpen(true);
  }

  if (!activePlaythrough || !hv) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/upgrade/home/builder"
            className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <RiArrowLeftLine size={16} />
            Builder
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
              onClick={() => openPanel(undefined)}
              className="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-[12px] font-bold text-primary hover:bg-accent/90 transition-colors"
            >
              + Add Upgrade
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDraggingItem(null)}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 items-start">
              {slots.map((slot) => (
                <BuilderQueueCard
                  key={slot.id}
                  slot={slot}
                  queue={hv.builderQueues?.[String(slot.id)] ?? []}
                  activeUpgrade={activeBySlot.get(slot.id)}
                  conflicts={conflicts.filter((c) =>
                    (hv.builderQueues?.[String(slot.id)] ?? []).some((i) => i.id === c.queueItemId)
                  )}
                  multiInstanceBuildingIds={multiInstanceBuildingIds}
                  builderBoostPct={builderBoostPct}
                  onQueueChange={(q) => handleQueueChange(slot.id, q)}
                  onAddClick={(id) => openPanel(id)}
                  onStartFirst={(item) => handleStartFirst(item, slot.id)}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {draggingItem && <QueueItemOverlay item={draggingItem} />}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {panelOpen && (
        <AvailableBuilderUpgradesPanel
          hv={hv}
          slots={slots}
          targetSlotId={panelSlotId}
          builderBoostPct={builderBoostPct}
          onAdd={handleAddItem}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {plannerOpen && (
        <ResourcePlannerModal
          groups={resourceGroups}
          onClose={() => setPlannerOpen(false)}
        />
      )}
    </div>
  );
}
export default BuilderQueuePage;
