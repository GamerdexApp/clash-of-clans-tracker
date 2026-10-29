"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { getGuardiansAtTH } from "@/lib/utils/massEditHelpers";
import { getBuildingUpgradeSteps, getBuilderSlots } from "@/lib/utils/upgradeHelpers";
import {
  startBuildingUpgrade,
  finishBuildingUpgrade,
  cancelBuildingUpgrade,
  adjustBuildingUpgrade,
} from "@/lib/utils/upgradeActions";
import { UpgradeRow } from "@/components/upgrade/UpgradeRow";

const GuardiansUpgradePage = () => {
  const router = useRouter();
  const { activePlaythrough, appSettings, isLoaded, updatePlaythrough } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const guardians = useMemo(() => getGuardiansAtTH(thLevel), [thLevel]);
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
          <h1 className="text-xl font-extrabold text-gray-900">Guardians</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {guardians.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Guardians unlock at TH18.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {guardians.map((g) => {
              const instances = Array.from({ length: g.instanceCount }, (_, i) => {
                const inst = (hv.defenses[g.id] ?? [])[i] ?? { level: 0 };
                return {
                  currentLevel: inst.level,
                  maxLevel: g.maxLevel,
                  upgradeState: inst.upgrade,
                };
              });
              return (
                <UpgradeRow
                  key={g.id}
                  name={g.name}
                  imageUrl={g.imageUrl}
                  instances={instances}
                  getAllSteps={(level) => getBuildingUpgradeSteps(g.id, level, thLevel)}
                  slots={slots}
                  onStartUpgrade={(idx, step, builderId) =>
                    save(startBuildingUpgrade(hv, "defenses", g.id, idx, step, builderId))
                  }
                  onFinishUpgrade={(idx) =>
                    save(finishBuildingUpgrade(hv, "defenses", g.id, idx))
                  }
                  onCancelUpgrade={(idx) =>
                    save(cancelBuildingUpgrade(hv, "defenses", g.id, idx))
                  }
                  onAdjustUpgrade={(idx, finishesAt) =>
                    save(adjustBuildingUpgrade(hv, "defenses", g.id, idx, finishesAt))
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default GuardiansUpgradePage;
