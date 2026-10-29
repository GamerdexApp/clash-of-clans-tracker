"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { getResourceBuildingsAtTH } from "@/lib/utils/massEditHelpers";
import { getBuildingUpgradeSteps, getBuilderSlots } from "@/lib/utils/upgradeHelpers";
import {
  startBuildingUpgrade,
  finishBuildingUpgrade,
  cancelBuildingUpgrade,
  adjustBuildingUpgrade,
} from "@/lib/utils/upgradeActions";
import { UpgradeRow } from "@/components/upgrade/UpgradeRow";

const ResourcesUpgradePage = () => {
  const router = useRouter();
  const { activePlaythrough, appSettings, isLoaded, updatePlaythrough } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const buildings = useMemo(() => getResourceBuildingsAtTH(thLevel), [thLevel]);
  const slots = hv ? getBuilderSlots(hv, appSettings.goblinBuilderEnabled) : [];

  const save = (newHv: typeof hv)=> {
    if (!activePlaythrough || !newHv) return;
    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, homeVillage: newHv },
    });
  }

  if (!activePlaythrough || !hv) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Resource Buildings</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {buildings.map((b) => {
            const instances = Array.from({ length: b.instanceCount }, (_, i) => {
              const inst = (hv.resourceBuildings[b.id] ?? [])[i] ?? { level: 0 };
              return {
                currentLevel: inst.level,
                maxLevel: b.maxLevel,
                upgradeState: inst.upgrade,
              };
            });
            return (
              <UpgradeRow
                key={b.id}
                name={b.name}
                imageUrl={b.imageUrl}
                instances={instances}
                getAllSteps={(level) => getBuildingUpgradeSteps(b.id, level, thLevel)}
                slots={slots}
                onStartUpgrade={(idx, step, builderId) =>
                  save(startBuildingUpgrade(hv, "resourceBuildings", b.id, idx, step, builderId))
                }
                onFinishUpgrade={(idx) =>
                  save(finishBuildingUpgrade(hv, "resourceBuildings", b.id, idx))
                }
                onCancelUpgrade={(idx) =>
                  save(cancelBuildingUpgrade(hv, "resourceBuildings", b.id, idx))
                }
                onAdjustUpgrade={(idx, finishesAt) =>
                  save(adjustBuildingUpgrade(hv, "resourceBuildings", b.id, idx, finishesAt))
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default ResourcesUpgradePage;
