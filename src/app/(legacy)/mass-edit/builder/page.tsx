"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TabItem, Tabs } from "flowbite-react";
import { successToast } from "@/lib/notifications";
import { massEditTabsTheme } from "@/lib/constants/massEditTheme";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { SliderRow } from "@/components/mass-edit/SliderRow";
import { BuildingTab } from "@/components/mass-edit/builder/BuildingTab";
import { ItemTab } from "@/components/mass-edit/ItemTab";
import {
  getBuilderDefensesAtBH,
  getBuilderArmyBuildingsAtBH,
  getBuilderResourceBuildingsAtBH,
  getBuilderTrapsAtBH,
  getBuilderTroopsAtBH,
  getBuilderHeroesAtBH,
  getBuilderWallLevelsAtBH,
} from "@/lib/utils/massEditBuilderHelpers";
import type {
  BuildingEditData,
  ItemEditData,
} from "@/lib/utils/massEditHelpers";
import type { LevelMap } from "@/types/app/massEdit";
import type { BuilderBaseData, BuildingInstance, BuildingRecord, TrackedItem } from "@/types/app/game";

const MassEditBuilderPage = () => {
  const { activePlaythrough, updatePlaythrough, isLoaded } = usePlaythrough();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const bhLevel = activePlaythrough?.data.builderBase.builderHallLevel ?? 1;

  const defenseData  = useMemo(() => getBuilderDefensesAtBH(bhLevel),          [bhLevel]);
  const armyData     = useMemo(() => getBuilderArmyBuildingsAtBH(bhLevel),      [bhLevel]);
  const resourceData = useMemo(() => getBuilderResourceBuildingsAtBH(bhLevel),  [bhLevel]);
  const trapData     = useMemo(() => getBuilderTrapsAtBH(bhLevel),              [bhLevel]);
  const troopData    = useMemo(() => getBuilderTroopsAtBH(bhLevel),             [bhLevel]);
  const heroData     = useMemo(() => getBuilderHeroesAtBH(bhLevel),             [bhLevel]);
  const wallInfo     = useMemo(() => getBuilderWallLevelsAtBH(bhLevel),         [bhLevel]);

  const [buildingLevels, setBuildingLevels] = useState<LevelMap>({});
  const [troopLevels,    setTroopLevels]    = useState<LevelMap>({});
  const [heroLevels,     setHeroLevels]     = useState<LevelMap>({});
  const [wallCounts,     setWallCounts]     = useState<LevelMap>({});
  const [isDirty,        setIsDirty]        = useState(false);

  const [syncedPlaythroughId, setSyncedPlaythroughId] = useState<string | undefined>(undefined);

  if (activePlaythrough && activePlaythrough.id !== syncedPlaythroughId) {
    setSyncedPlaythroughId(activePlaythrough.id);
    const bb = activePlaythrough.data.builderBase;

    const initBuildings = (editItems: BuildingEditData[], record: BuildingRecord)=> {
      const bLevels: LevelMap = {};
      for (const b of editItems) {
        const existing = record[b.id] ?? [];
        for (let i = 0; i < b.instanceCount; i++) {
          bLevels[`${b.id}-${i}`] = existing[i]?.level ?? 0;
        }
      }
      return bLevels;
    }

    const allBuildingData = [...defenseData, ...armyData, ...resourceData, ...trapData];
    const allRecords: BuildingRecord = {
      ...bb.defenses,
      ...bb.armyBuildings,
      ...bb.resourceBuildings,
      ...bb.traps,
    };
    setBuildingLevels(initBuildings(allBuildingData, allRecords));

    const toMap = (items: TrackedItem[]) => Object.fromEntries(items.map((t) => [t.name, t.level]));
    setTroopLevels(toMap(bb.troops));
    setHeroLevels(Object.fromEntries(bb.heroes.map((h) => [h.name, h.level])));

    const wMap: LevelMap = {};
    for (const wl of wallInfo.levels) {
      wMap[String(wl.level)] = bb.walls[String(wl.level)] ?? 0;
    }
    setWallCounts(wMap);

    setIsDirty(false);
  }

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function (state: unknown, title: string, url?: string | URL | null) {
      if (!window.confirm("You have unsaved changes. Leave without saving?")) return;
      originalPushState(state, title, url);
    };
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.history.pushState = originalPushState;
    };
  }, [isDirty]);

  const setBuilding = (key: string, val: number)=> { setBuildingLevels((p) => ({ ...p, [key]: val })); setIsDirty(true); }
  const setTroop = (name: string, val: number)=> { setTroopLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  const setHero = (name: string, val: number)=> { setHeroLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }

  const setWall = (levelStr: string, newCount: number)=> {
    setWallCounts((prev) => {
      const allocated = Object.values(prev).reduce((s, c) => s + c, 0);
      const current = prev[levelStr] ?? 0;
      const maxAllowable = wallInfo.totalAtTH - (allocated - current);
      const clamped = Math.max(0, Math.min(newCount, maxAllowable));
      return { ...prev, [levelStr]: clamped };
    });
    setIsDirty(true);
  }

  const handleSave = ()=> {
    if (!activePlaythrough) return;
    const bb = activePlaythrough.data.builderBase;

    const rebuildRecord = (editItems: BuildingEditData[], existing: BuildingRecord): BuildingRecord => {
      const result: BuildingRecord = {};
      for (const b of editItems) {
        result[b.id] = [];
        for (let i = 0; i < b.instanceCount; i++) {
          const inst: BuildingInstance = {
            level: buildingLevels[`${b.id}-${i}`] ?? 0,
            upgrade: existing[b.id]?.[i]?.upgrade,
          };
          result[b.id].push(inst);
        }
      }
      return result;
    }

    const rebuildItems = (editItems: ItemEditData[], levelMap: LevelMap, existing: TrackedItem[]): TrackedItem[] => {
      return editItems.map((item) => ({
        name: item.name,
        level: levelMap[item.name] ?? 0,
        upgrade: existing.find((e) => e.name === item.name)?.upgrade,
      }));
    }

    const newHeroes = heroData.map((h) => {
      const existing = bb.heroes.find((e) => e.name === h.name);
      return {
        name: h.name,
        level: heroLevels[h.name] ?? 0,
        upgrade: existing?.upgrade,
        equipment: existing?.equipment ?? [],
      };
    });

    const newWalls: Record<string, number> = {};
    for (const [lvl, count] of Object.entries(wallCounts)) {
      if (count > 0) newWalls[lvl] = count;
    }

    const newBB: BuilderBaseData = {
      ...bb,
      defenses:          rebuildRecord(defenseData,  bb.defenses),
      armyBuildings:     rebuildRecord(armyData,     bb.armyBuildings),
      resourceBuildings: rebuildRecord(resourceData, bb.resourceBuildings),
      traps:             rebuildRecord(trapData,     bb.traps),
      troops:            rebuildItems(troopData, troopLevels, bb.troops),
      heroes:            newHeroes,
      walls:             newWalls,
    };

    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, builderBase: newBB },
    });
    setIsDirty(false);
    successToast({ message: "Builder Base saved!" });
  }

  const allocated = Object.values(wallCounts).reduce((s, c) => s + c, 0);
  const remaining = wallInfo.totalAtTH - allocated;

  if (!activePlaythrough) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Mass Edit — Builder Base</h1>
          <span className="text-sm text-gray-500">BH{bhLevel}</span>
          {isDirty && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 z-10 h-13 w-12 bg-linear-to-l from-highlight to-transparent" />
        <Tabs variant="pills" theme={massEditTabsTheme}>

          <TabItem title="Defenses">
            <BuildingTab
              buildings={defenseData}
              buildingLevels={buildingLevels}
              onBuildingChange={setBuilding}
            />
          </TabItem>

          <TabItem title="Army">
            <BuildingTab
              buildings={armyData}
              buildingLevels={buildingLevels}
              onBuildingChange={setBuilding}
              sectionsInColumns
            />
          </TabItem>

          <TabItem title="Resources">
            <BuildingTab
              buildings={resourceData}
              buildingLevels={buildingLevels}
              onBuildingChange={setBuilding}
            />
          </TabItem>

          <TabItem title="Traps">
            <BuildingTab
              buildings={trapData}
              buildingLevels={buildingLevels}
              onBuildingChange={setBuilding}
            />
          </TabItem>

          <TabItem title="Troops">
            <ItemTab items={troopData} levelMap={troopLevels} onChange={setTroop} />
          </TabItem>

          <TabItem title="Heroes">
            <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
              {heroData.length === 0 ? (
                <p className="col-span-full py-6 text-center text-sm text-gray-400">No heroes available at this Builder Hall level.</p>
              ) : (
                heroData.map((h) => (
                  <SliderRow
                    key={h.name}
                    label={h.name}
                    imageUrl={h.imageUrl}
                    currentLevel={heroLevels[h.name] ?? 0}
                    maxLevel={h.maxLevel}
                    onChange={(val) => setHero(h.name, val)}
                  />
                ))
              )}
            </div>
          </TabItem>

          <TabItem title="Walls">
            <div>
              <div className="mb-4 flex items-center gap-4 rounded-xl border border-secondary/80 bg-highlight p-3">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-extrabold text-gray-900">{wallInfo.totalAtTH}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</span>
                </div>
                <div className="h-8 w-px bg-secondary/80" />
                <div className="flex flex-col items-center">
                  <span className="text-xl font-extrabold text-gray-900">{allocated}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Allocated</span>
                </div>
                <div className="h-8 w-px bg-secondary/80" />
                <div className="flex flex-col items-center">
                  <span className={`text-xl font-extrabold ${remaining === 0 ? "text-green-600" : remaining < 0 ? "text-action" : "text-amber-600"}`}>
                    {remaining}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Remaining</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
                {wallInfo.levels.map((wl) => (
                  <SliderRow
                    key={wl.level}
                    label={`Level ${wl.level}`}
                    imageUrl={wl.imageUrl}
                    currentLevel={wallCounts[String(wl.level)] ?? 0}
                    maxLevel={wallInfo.totalAtTH}
                    onChange={(val) => setWall(String(wl.level), val)}
                    neverLocked
                  />
                ))}
              </div>
            </div>
          </TabItem>

        </Tabs>
      </div>

      <div className="shrink-0 border-t border-secondary/80 bg-highlight px-4 py-3 flex items-center justify-end gap-3">
        <Button color="gray" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isDirty}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
export default MassEditBuilderPage;
