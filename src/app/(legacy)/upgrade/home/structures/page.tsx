"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TabItem, Tabs } from "flowbite-react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import {
  getDefensesAtTH,
  getArmyBuildingsAtTH,
  getResourceBuildingsAtTH,
} from "@/lib/utils/massEditHelpers";
import {
  getBuildingUpgradeSteps,
  getBuilderSlots,
  countActiveInRecord,
} from "@/lib/utils/upgradeHelpers";
import {
  startBuildingUpgrade,
  finishBuildingUpgrade,
  cancelBuildingUpgrade,
  adjustBuildingUpgrade,
} from "@/lib/utils/upgradeActions";
import { massEditTabsTheme } from "@/lib/constants/massEditTheme";
import { UpgradeRow } from "@/components/upgrade/UpgradeRow";
import type { BuildingRecord, BuildingRecordKey } from "@/types/app/game";

const TabTitle = ({ label, count }: { label: string; count: number }) => {
  return (
    <span className="flex items-center gap-1.5">
      {label}
      {count > 0 && (
        <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold leading-none text-gray-900">
          {count}
        </span>
      )}
    </span>
  );
}

const StructuresUpgradePage = () => {
  const router = useRouter();
  const { activePlaythrough, appSettings, isLoaded, updatePlaythrough } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const defenses = useMemo(() => getDefensesAtTH(thLevel), [thLevel]);
  const army = useMemo(() => getArmyBuildingsAtTH(thLevel), [thLevel]);
  const resources = useMemo(() => getResourceBuildingsAtTH(thLevel), [thLevel]);
  const slots = hv ? getBuilderSlots(hv, appSettings.goblinBuilderEnabled) : [];

  const save = (newHv: typeof hv)=> {
    if (!activePlaythrough || !newHv) return;
    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, homeVillage: newHv },
    });
  }

  if (!activePlaythrough || !hv) return null;

  const renderBuildings = (
    buildings: ReturnType<typeof getDefensesAtTH>,
    recordKey: BuildingRecordKey
  )=> {
    return (
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {buildings.map((b) => {
          const instances = Array.from({ length: b.instanceCount }, (_, i) => {
            const inst = (hv![recordKey][b.id] ?? [])[i] ?? { level: 0 };
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
                save(startBuildingUpgrade(hv!, recordKey, b.id, idx, step, builderId))
              }
              onFinishUpgrade={(idx) =>
                save(finishBuildingUpgrade(hv!, recordKey, b.id, idx))
              }
              onCancelUpgrade={(idx) =>
                save(cancelBuildingUpgrade(hv!, recordKey, b.id, idx))
              }
              onAdjustUpgrade={(idx, finishesAt) =>
                save(adjustBuildingUpgrade(hv!, recordKey, b.id, idx, finishesAt))
              }
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Structures</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 z-10 h-13 w-12 bg-linear-to-l from-highlight to-transparent" />
        <Tabs variant="pills" theme={massEditTabsTheme}>
          <TabItem
            title={
              <TabTitle
                label="Defenses"
                count={countActiveInRecord(hv.defenses as BuildingRecord)}
              />
            }
          >
            {renderBuildings(defenses, "defenses")}
          </TabItem>
          <TabItem
            title={
              <TabTitle
                label="Army"
                count={countActiveInRecord(hv.armyBuildings as BuildingRecord)}
              />
            }
          >
            {renderBuildings(army, "armyBuildings")}
          </TabItem>
          <TabItem
            title={
              <TabTitle
                label="Resources"
                count={countActiveInRecord(hv.resourceBuildings as BuildingRecord)}
              />
            }
          >
            {renderBuildings(resources, "resourceBuildings")}
          </TabItem>
        </Tabs>
      </div>
    </div>
  );
}
export default StructuresUpgradePage;
