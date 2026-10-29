"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TabItem, Tabs } from "flowbite-react";
import { successToast } from "@/lib/notifications";
import { massEditTabsTheme } from "@/lib/constants/massEditTheme";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { SliderRow } from "@/components/mass-edit/SliderRow";
import { SectionHeader } from "@/components/mass-edit/SectionHeader";
import { BuildingTab } from "@/components/mass-edit/home/BuildingTab";
import { ItemTab } from "@/components/mass-edit/ItemTab";
import {
  getDefensesAtTH,
  getArmyBuildingsAtTH,
  getResourceBuildingsAtTH,
  getTrapsAtTH,
  getGuardiansAtTH,
  getOtherBuildingsAtTH,
  getTroopsAtTH,
  getSpellsAtTH,
  getSiegeMachinesAtTH,
  getPetsAtTH,
  getHeroesAtTH,
  getAllEquipment,
  getCraftedDefenses,
  getWallLevelsAtTH,
  type BuildingEditData,
  type ItemEditData,
} from "@/lib/utils/massEditHelpers";
import type { LevelMap } from "@/types/app/massEdit";
import type { BuildingInstance, BuildingRecord, HomeVillageData, TrackedItem } from "@/types/app/game";

const MassEditHomePage = () => {
  const { activePlaythrough, updatePlaythrough, isLoaded } = usePlaythrough();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const thLevel = activePlaythrough?.data.homeVillage.townHallLevel ?? 1;

  const defenseData     = useMemo(() => getDefensesAtTH(thLevel),         [thLevel]);
  const armyData        = useMemo(() => getArmyBuildingsAtTH(thLevel),     [thLevel]);
  const otherData       = useMemo(() => getOtherBuildingsAtTH(thLevel),    [thLevel]);
  const resourceData    = useMemo(() => getResourceBuildingsAtTH(thLevel), [thLevel]);
  const trapData        = useMemo(() => getTrapsAtTH(thLevel),             [thLevel]);
  const guardianData    = useMemo(() => getGuardiansAtTH(thLevel),         [thLevel]);
  const troopData       = useMemo(() => getTroopsAtTH(thLevel),            [thLevel]);
  const spellData       = useMemo(() => getSpellsAtTH(thLevel),            [thLevel]);
  const siegeData       = useMemo(() => getSiegeMachinesAtTH(thLevel),     [thLevel]);
  const petData         = useMemo(() => getPetsAtTH(thLevel),              [thLevel]);
  const heroData        = useMemo(() => getHeroesAtTH(thLevel),            [thLevel]);
  const equipData       = useMemo(() => getAllEquipment(),                  []);
  const craftedData     = useMemo(() => thLevel >= 18 ? getCraftedDefenses() : [], [thLevel]);
  const wallInfo        = useMemo(() => getWallLevelsAtTH(thLevel),        [thLevel]);

  const [buildingLevels,    setBuildingLevels]    = useState<LevelMap>({});
  const [superchargeLevels, setSuperchargeLevels] = useState<LevelMap>({});
  const [troopLevels,       setTroopLevels]       = useState<LevelMap>({});
  const [spellLevels,       setSpellLevels]       = useState<LevelMap>({});
  const [siegeLevels,       setSiegeLevels]       = useState<LevelMap>({});
  const [petLevels,         setPetLevels]         = useState<LevelMap>({});
  const [heroLevels,        setHeroLevels]        = useState<LevelMap>({});
  const [equipLevels,       setEquipLevels]       = useState<LevelMap>({});
  const [craftedLevels,     setCraftedLevels]     = useState<LevelMap>({});
  const [wallCounts,        setWallCounts]        = useState<LevelMap>({});
  const [isDirty,           setIsDirty]           = useState(false);

  const [syncedPlaythroughId, setSyncedPlaythroughId] = useState<string | undefined>(undefined);

  if (activePlaythrough && activePlaythrough.id !== syncedPlaythroughId) {
    setSyncedPlaythroughId(activePlaythrough.id);
    const hv = activePlaythrough.data.homeVillage;

    const initBuildings = (editItems: BuildingEditData[], record: BuildingRecord)=> {
      const bLevels: LevelMap = {};
      const scLevels: LevelMap = {};
      for (const b of editItems) {
        const existing = record[b.id] ?? [];
        for (let i = 0; i < b.instanceCount; i++) {
          bLevels[`${b.id}-${i}`] = existing[i]?.level ?? 0;
          if (b.superchargeTiers > 0) {
            scLevels[`${b.id}-${i}`] = existing[i]?.superchargeLevel ?? 0;
          }
        }
      }
      return { bLevels, scLevels };
    }

    const allBuildingData = [...defenseData, ...guardianData, ...armyData, ...otherData, ...resourceData, ...trapData];
    const allRecords: BuildingRecord = { ...hv.defenses, ...hv.armyBuildings, ...hv.resourceBuildings, ...hv.traps };
    const { bLevels, scLevels } = initBuildings(allBuildingData, allRecords);
    setBuildingLevels(bLevels);
    setSuperchargeLevels(scLevels);

    const toMap = (items: TrackedItem[]) => Object.fromEntries(items.map((t) => [t.name, t.level]));
    setTroopLevels(toMap(hv.troops));
    setSpellLevels(toMap(hv.spells));
    setSiegeLevels(toMap(hv.siegeMachines));
    setPetLevels(toMap(hv.pets));

    setHeroLevels(Object.fromEntries(hv.heroes.map((h) => [h.name, h.level])));

    const eqMap: LevelMap = {};
    for (const hero of hv.heroes) {
      for (const eq of hero.equipment) {
        eqMap[eq.name] = eq.level;
      }
    }
    setEquipLevels(eqMap);

    if (thLevel >= 18) {
      const cMap: LevelMap = {};
      for (const cd of craftedData) {
        const tracked = hv.craftedDefenses[cd.id];
        cMap[`${cd.id}-0`] = tracked?.modules[0] ?? 0;
        cMap[`${cd.id}-1`] = tracked?.modules[1] ?? 0;
        cMap[`${cd.id}-2`] = tracked?.modules[2] ?? 0;
      }
      setCraftedLevels(cMap);
    }

    const wMap: LevelMap = {};
    for (const wl of wallInfo.levels) {
      wMap[String(wl.level)] = hv.walls[String(wl.level)] ?? 0;
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
  const setSupercharge = (key: string, val: number)=> { setSuperchargeLevels((p) => ({ ...p, [key]: val })); setIsDirty(true); }
  const setTroop = (name: string, val: number)=> { setTroopLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  const setSpell = (name: string, val: number)=> { setSpellLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  const setSiege = (name: string, val: number)=> { setSiegeLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  const setPet = (name: string, val: number)=> { setPetLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  const setHero = (name: string, val: number)=> { setHeroLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  const setEquip = (name: string, val: number)=> { setEquipLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  const setCrafted = (key: string, val: number)=> { setCraftedLevels((p) => ({ ...p, [key]: val })); setIsDirty(true); }

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
    const hv = activePlaythrough.data.homeVillage;

    const rebuildRecord = (editItems: BuildingEditData[], existing: BuildingRecord): BuildingRecord => {
      const result: BuildingRecord = {};
      for (const b of editItems) {
        result[b.id] = [];
        for (let i = 0; i < b.instanceCount; i++) {
          const inst: BuildingInstance = {
            level: buildingLevels[`${b.id}-${i}`] ?? 0,
            upgrade: existing[b.id]?.[i]?.upgrade,
          };
          if (b.superchargeTiers > 0) {
            inst.superchargeLevel = superchargeLevels[`${b.id}-${i}`] ?? 0;
          }
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

    const combinedDefenseData = [...defenseData, ...guardianData];

    const newHeroes = heroData.map((h) => {
      const existing = hv.heroes.find((e) => e.name === h.name);
      return {
        name: h.name,
        level: heroLevels[h.name] ?? 0,
        upgrade: existing?.upgrade,
        equipment: (existing?.equipment ?? []).map((eq) => ({
          name: eq.name,
          level: equipLevels[eq.name] ?? eq.level,
        })),
      };
    });

    const newCrafted: HomeVillageData["craftedDefenses"] = thLevel >= 18
      ? Object.fromEntries(
          craftedData.map((cd) => [
            cd.id,
            { modules: [craftedLevels[`${cd.id}-0`] ?? 0, craftedLevels[`${cd.id}-1`] ?? 0, craftedLevels[`${cd.id}-2`] ?? 0] as [number, number, number] },
          ])
        )
      : hv.craftedDefenses;

    const newWalls: Record<string, number> = {};
    for (const [lvl, count] of Object.entries(wallCounts)) {
      if (count > 0) newWalls[lvl] = count;
    }

    const newHV: HomeVillageData = {
      ...hv,
      defenses:          rebuildRecord(combinedDefenseData, hv.defenses),
      armyBuildings:     rebuildRecord([...armyData, ...otherData], hv.armyBuildings),
      resourceBuildings: rebuildRecord(resourceData,        hv.resourceBuildings),
      traps:             rebuildRecord(trapData,            hv.traps),
      troops:            rebuildItems(troopData,   troopLevels, hv.troops),
      spells:            rebuildItems(spellData,   spellLevels, hv.spells),
      siegeMachines:     rebuildItems(siegeData,   siegeLevels, hv.siegeMachines),
      pets:              rebuildItems(petData,     petLevels,   hv.pets),
      heroes:            newHeroes,
      craftedDefenses:   newCrafted,
      walls:             newWalls,
    };

    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, homeVillage: newHV },
    });
    setIsDirty(false);
    successToast({ message: "Home Village saved!" });
  }

  const allocated = Object.values(wallCounts).reduce((s, c) => s + c, 0);
  const remaining = wallInfo.totalAtTH - allocated;

  if (!activePlaythrough) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Mass Edit — Home Village</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
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
              superchargeLevels={superchargeLevels}
              onBuildingChange={setBuilding}
              onSuperchargeChange={setSupercharge}
            />
          </TabItem>

          <TabItem title="Army">
            <BuildingTab
              buildings={[...armyData, ...otherData]}
              buildingLevels={buildingLevels}
              superchargeLevels={superchargeLevels}
              onBuildingChange={setBuilding}
              onSuperchargeChange={setSupercharge}
              sectionsInColumns
            />
          </TabItem>

          <TabItem title="Resources">
            <BuildingTab
              buildings={resourceData}
              buildingLevels={buildingLevels}
              superchargeLevels={superchargeLevels}
              onBuildingChange={setBuilding}
              onSuperchargeChange={setSupercharge}
            />
          </TabItem>

          {thLevel >= 18 && (
            <TabItem title="Crafted Defenses">
              <div>
                {craftedData.map((cd) => (
                  <div key={cd.id} className="mt-6 first:mt-0">
                    <SectionHeader>{cd.name}</SectionHeader>
                    <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
                      {cd.modules.map((mod, mi) => (
                        <SliderRow
                          key={mi}
                          label={mod.name}
                          imageUrl={cd.imageUrl}
                          currentLevel={craftedLevels[`${cd.id}-${mi}`] ?? 0}
                          maxLevel={mod.maxLevel}
                          onChange={(val) => setCrafted(`${cd.id}-${mi}`, val)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabItem>
          )}

          <TabItem title="Traps">
            <BuildingTab
              buildings={trapData}
              buildingLevels={buildingLevels}
              superchargeLevels={superchargeLevels}
              onBuildingChange={setBuilding}
              onSuperchargeChange={setSupercharge}
            />
          </TabItem>

          <TabItem title="Troops">
            <ItemTab items={troopData} levelMap={troopLevels} onChange={setTroop} />
          </TabItem>

          <TabItem title="Spells">
            <ItemTab items={spellData} levelMap={spellLevels} onChange={setSpell} />
          </TabItem>

          <TabItem title="Siege">
            <ItemTab items={siegeData} levelMap={siegeLevels} onChange={setSiege} emptyMsg="Siege Machines unlock at TH12." />
          </TabItem>

          <TabItem title="Pets">
            <ItemTab items={petData} levelMap={petLevels} onChange={setPet} emptyMsg="Pets unlock at TH14." />
          </TabItem>

          {thLevel >= 18 && (
            <TabItem title="Guardians">
              <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
                {guardianData.map((g) => (
                  <SliderRow
                    key={g.id}
                    label={g.name}
                    imageUrl={g.imageUrl}
                    currentLevel={buildingLevels[`${g.id}-0`] ?? 0}
                    maxLevel={g.maxLevel}
                    onChange={(val) => setBuilding(`${g.id}-0`, val)}
                  />
                ))}
              </div>
            </TabItem>
          )}

          <TabItem title="Heroes">
            <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
              {heroData.length === 0 ? (
                <p className="col-span-full py-6 text-center text-sm text-gray-400">No heroes available at this Town Hall level.</p>
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

          <TabItem title="Equipment">
            {heroData.map((h) => {
              const heroEquip = equipData.filter((e) => e.heroId === h.id);
              if (heroEquip.length === 0) return null;
              return (
                <div key={h.id} className="mt-6 first:mt-0">
                  <SectionHeader>{h.name}</SectionHeader>
                  <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
                    {heroEquip.map((eq) => (
                      <SliderRow
                        key={eq.name}
                        label={eq.name}
                        imageUrl={eq.imageUrl}
                        currentLevel={equipLevels[eq.name] ?? 0}
                        maxLevel={eq.maxLevel}
                        onChange={(val) => setEquip(eq.name, val)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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
export default MassEditHomePage;
