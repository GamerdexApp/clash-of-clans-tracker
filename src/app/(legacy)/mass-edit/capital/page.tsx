"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TabItem, Tabs } from "flowbite-react";
import { successToast, errorToast } from "@/lib/notifications";
import { massEditTabsTheme } from "@/lib/constants/massEditTheme";
import { DISTRICTS, type DistrictKey } from "@/lib/constants/capitalDistricts";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { ItemTab } from "@/components/mass-edit/ItemTab";
import { DistrictBuildingTab } from "@/components/mass-edit/capital/DistrictBuildingTab";
import {
  getCapitalPeakBuildings,
  getDistrictBuildings,
  getCapitalPeakTraps,
  getDistrictTraps,
  getDistrictArmyBuildings,
  getCapitalPeakWalls,
  getDistrictWalls,
  getCapitalTroops,
  getCapitalSpells,
  getMaxCapitalHallLevel,
  getMaxDistrictHallLevel,
  type CapitalWallInfo,
} from "@/lib/utils/massEditCapitalHelpers";
import type { BuildingEditData, ItemEditData } from "@/lib/utils/massEditHelpers";
import type { LevelMap } from "@/types/app/massEdit";
import type { CapitalBuildingRecord, ClanCapitalData, TrackedItem } from "@/types/app/game";

const MAX_CAPITAL_HALL = getMaxCapitalHallLevel();
const DISTRICT_MAX_LEVELS = Object.fromEntries(
  DISTRICTS.map((d) => [d.id, getMaxDistrictHallLevel(d.id)])
) as Record<string, number>;

const MassEditCapitalPage = () => {
  const { activePlaythrough, updatePlaythrough, isLoaded } = usePlaythrough();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const cc = activePlaythrough?.data.clanCapital;

  const [capitalHallDraft, setCapitalHallDraft] = useState(() => cc?.capitalPeak.hallLevel ?? 0);
  const [districtHallDrafts, setDistrictHallDrafts] = useState<Record<string, number>>(
    () => Object.fromEntries(DISTRICTS.map((d) => [d.id, cc?.[d.key as DistrictKey].hallLevel ?? 0]))
  );

  const capitalPeakData = useMemo(
    () => getCapitalPeakBuildings(capitalHallDraft),
    [capitalHallDraft]
  );
  const districtBuildingData = useMemo(
    () => Object.fromEntries(
      DISTRICTS.map((d) => [d.id, getDistrictBuildings(d.id, districtHallDrafts[d.id] ?? 0)])
    ) as Record<string, BuildingEditData[]>,
    [districtHallDrafts]
  );

  const districtArmyData = useMemo(
    () => Object.fromEntries(
      DISTRICTS.map((d) => [d.id, getDistrictArmyBuildings(d.id, districtHallDrafts[d.id] ?? 0)])
    ) as Record<string, BuildingEditData[]>,
    [districtHallDrafts]
  );

  const capitalPeakTraps = useMemo(
    () => getCapitalPeakTraps(capitalHallDraft),
    [capitalHallDraft]
  );
  const districtTrapData = useMemo(
    () => Object.fromEntries(
      DISTRICTS.map((d) => [d.id, getDistrictTraps(d.id, districtHallDrafts[d.id] ?? 0)])
    ) as Record<string, BuildingEditData[]>,
    [districtHallDrafts]
  );

  const capitalPeakWallInfo = useMemo(
    () => getCapitalPeakWalls(capitalHallDraft),
    [capitalHallDraft]
  );
  const districtWallInfos = useMemo(
    () => Object.fromEntries(
      DISTRICTS.map((d) => [d.id, getDistrictWalls(d.id, districtHallDrafts[d.id] ?? 0)])
    ) as Record<string, CapitalWallInfo>,
    [districtHallDrafts]
  );

  const troopData = useMemo(
    () => getCapitalTroops(districtHallDrafts),
    [districtHallDrafts]
  );
  const spellData = useMemo(
    () => getCapitalSpells(districtHallDrafts),
    [districtHallDrafts]
  );

  const [buildingLevels, setBuildingLevels] = useState<LevelMap>({});
  const [wallCounts,     setWallCounts]     = useState<Record<string, Record<string, number>>>({});
  const [troopLevels,    setTroopLevels]    = useState<LevelMap>({});
  const [spellLevels,    setSpellLevels]    = useState<LevelMap>({});
  const [isDirty,        setIsDirty]        = useState(false);

  const [syncedPlaythroughId, setSyncedPlaythroughId] = useState<string | undefined>(undefined);

  if (activePlaythrough && activePlaythrough.id !== syncedPlaythroughId) {
    setSyncedPlaythroughId(activePlaythrough.id);
    const cap = activePlaythrough.data.clanCapital;

    setCapitalHallDraft(cap.capitalPeak.hallLevel);
    setDistrictHallDrafts(
      Object.fromEntries(DISTRICTS.map((d) => [d.id, cap[d.key as DistrictKey].hallLevel]))
    );

    const bLevels: LevelMap = {};

    const initDistrict = (districtId: string, buildings: BuildingEditData[], record: CapitalBuildingRecord)=> {
      for (const b of buildings) {
        const existing = record[b.id] ?? [];
        for (let i = 0; i < b.instanceCount; i++) {
          bLevels[`${districtId}-${b.id}-${i}`] = existing[i] ?? 0;
        }
      }
    }

    const peakBuildings = getCapitalPeakBuildings(cap.capitalPeak.hallLevel);
    initDistrict("capitalPeak", peakBuildings, cap.capitalPeak.buildings);
    const peakTraps = getCapitalPeakTraps(cap.capitalPeak.hallLevel);
    initDistrict("capitalPeak", peakTraps, cap.capitalPeak.buildings);

    for (const d of DISTRICTS) {
      const dBuildings = getDistrictBuildings(d.id, cap[d.key as DistrictKey].hallLevel);
      initDistrict(d.id, dBuildings, cap[d.key as DistrictKey].buildings);
      const dTraps = getDistrictTraps(d.id, cap[d.key as DistrictKey].hallLevel);
      initDistrict(d.id, dTraps, cap[d.key as DistrictKey].buildings);
      const dArmy = getDistrictArmyBuildings(d.id, cap[d.key as DistrictKey].hallLevel);
      initDistrict(d.id, dArmy, cap[d.key as DistrictKey].buildings);
    }

    setBuildingLevels(bLevels);

    const wCounts: Record<string, Record<string, number>> = {};
    const peakWalls = getCapitalPeakWalls(cap.capitalPeak.hallLevel);
    wCounts["capitalPeak"] = Object.fromEntries(
      peakWalls.levels.map((wl) => [String(wl.level), cap.capitalPeak.walls?.[String(wl.level)] ?? 0])
    );
    for (const d of DISTRICTS) {
      const dWalls = getDistrictWalls(d.id, cap[d.key as DistrictKey].hallLevel);
      wCounts[d.id] = Object.fromEntries(
        dWalls.levels.map((wl) => [String(wl.level), cap[d.key as DistrictKey].walls?.[String(wl.level)] ?? 0])
      );
    }
    setWallCounts(wCounts);

    const toMap = (items: TrackedItem[]) => Object.fromEntries(items.map((t) => [t.name, t.level]));
    setTroopLevels(toMap(cap.troops));
    setSpellLevels(toMap(cap.spells));

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

  const handleCapitalHallChange = (newLevel: number)=> {
    setCapitalHallDraft(newLevel);
    const newBuildings = getCapitalPeakBuildings(newLevel);
    const newTraps = getCapitalPeakTraps(newLevel);
    setBuildingLevels((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith("capitalPeak-")) delete next[key];
      }
      for (const b of [...newBuildings, ...newTraps]) {
        for (let i = 0; i < b.instanceCount; i++) {
          next[`capitalPeak-${b.id}-${i}`] = 0;
        }
      }
      return next;
    });
    const newWalls = getCapitalPeakWalls(newLevel);
    setWallCounts((prev) => ({
      ...prev,
      capitalPeak: Object.fromEntries(newWalls.levels.map((wl) => [String(wl.level), 0])),
    }));
    setIsDirty(true);
  }

  const handleDistrictHallChange = (districtId: string, newLevel: number)=> {
    setDistrictHallDrafts((prev) => ({ ...prev, [districtId]: newLevel }));
    const newDefenses = getDistrictBuildings(districtId, newLevel);
    const newTraps = getDistrictTraps(districtId, newLevel);
    const newArmy = getDistrictArmyBuildings(districtId, newLevel);
    setBuildingLevels((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${districtId}-`)) delete next[key];
      }
      for (const b of [...newDefenses, ...newTraps, ...newArmy]) {
        for (let i = 0; i < b.instanceCount; i++) {
          next[`${districtId}-${b.id}-${i}`] = 0;
        }
      }
      return next;
    });
    const newWalls = getDistrictWalls(districtId, newLevel);
    setWallCounts((prev) => ({
      ...prev,
      [districtId]: Object.fromEntries(newWalls.levels.map((wl) => [String(wl.level), 0])),
    }));
    setIsDirty(true);
  }

  const setBuilding = (key: string, val: number)=> { setBuildingLevels((p) => ({ ...p, [key]: val })); setIsDirty(true); }
  const setWall = (districtId: string, level: string, count: number)=> {
    setWallCounts((p) => ({ ...p, [districtId]: { ...(p[districtId] ?? {}), [level]: count } }));
    setIsDirty(true);
  }
  const setTroop = (name: string, val: number)=> { setTroopLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  const setSpell = (name: string, val: number)=> { setSpellLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }

  const handleSave = ()=> {
    if (!activePlaythrough) return;

    const wallErrors: string[] = [];
    const wallChecks: Array<{ label: string; info: CapitalWallInfo; counts: Record<string, number> }> = [
      { label: "Capital Hall", info: capitalPeakWallInfo, counts: wallCounts["capitalPeak"] ?? {} },
      ...DISTRICTS.map((d) => ({
        label: d.label,
        info: districtWallInfos[d.id] ?? { maxLevel: 0, totalCount: 0, levels: [] },
        counts: wallCounts[d.id] ?? {},
      })),
    ];
    for (const { label, info, counts } of wallChecks) {
      if (info.totalCount === 0) continue;
      const allocated = Object.values(counts).reduce((s, c) => s + c, 0);
      if (allocated > info.totalCount) {
        wallErrors.push(`${label}: ${allocated} allocated, only ${info.totalCount} available`);
      }
    }
    if (wallErrors.length > 0) {
      errorToast({ message: `Wall counts exceed total:\n${wallErrors.join("\n")}` });
      return;
    }

    const cap = activePlaythrough.data.clanCapital;

    const rebuildDistrictBuildings = (
      districtId: string,
      buildings: BuildingEditData[]
    ): CapitalBuildingRecord => {
      const result: CapitalBuildingRecord = {};
      for (const b of buildings) {
        result[b.id] = [];
        for (let i = 0; i < b.instanceCount; i++) {
          result[b.id].push(buildingLevels[`${districtId}-${b.id}-${i}`] ?? 0);
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

    const newCap: ClanCapitalData = {
      ...cap,
      capitalPeak: {
        hallLevel: capitalHallDraft,
        buildings: rebuildDistrictBuildings("capitalPeak", capitalPeakData),
        walls: wallCounts["capitalPeak"] ?? {},
      },
      ...Object.fromEntries(
        DISTRICTS.map((d) => [
          d.key,
          {
            hallLevel: districtHallDrafts[d.id] ?? 0,
            buildings: rebuildDistrictBuildings(
              d.id,
              districtBuildingData[d.id] ?? []
            ),
            walls: wallCounts[d.id] ?? {},
          },
        ])
      ),
      troops: rebuildItems(troopData, troopLevels, cap.troops),
      spells: rebuildItems(spellData, spellLevels, cap.spells),
    };

    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, clanCapital: newCap },
    });
    setIsDirty(false);
    successToast({ message: "Clan Capital saved!" });
  }

  if (!activePlaythrough || !cc) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Mass Edit — Clan Capital</h1>
          <span className="text-sm text-gray-500">Capital Hall {capitalHallDraft}</span>
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

          <TabItem title="Capital Hall">
            <DistrictBuildingTab
              districtId="capitalPeak"
              defenseBuildings={capitalPeakData}
              trapBuildings={capitalPeakTraps}
              armyBuildings={[]}
              wallInfo={capitalPeakWallInfo}
              buildingLevels={buildingLevels}
              wallLevelCounts={wallCounts["capitalPeak"] ?? {}}
              onBuildingChange={setBuilding}
              onWallChange={(level, count) => setWall("capitalPeak", level, count)}
              dhLevel={capitalHallDraft}
              maxHallLevel={MAX_CAPITAL_HALL}
              onHallLevelChange={handleCapitalHallChange}
              hallLabel="Capital Hall Level"
            />
          </TabItem>

          {DISTRICTS.map((d) => (
            <TabItem key={d.id} title={d.label}>
              <DistrictBuildingTab
                districtId={d.id}
                defenseBuildings={districtBuildingData[d.id] ?? []}
                trapBuildings={districtTrapData[d.id] ?? []}
                armyBuildings={districtArmyData[d.id] ?? []}
                wallInfo={districtWallInfos[d.id] ?? { maxLevel: 0, totalCount: 0, levels: [] }}
                buildingLevels={buildingLevels}
                wallLevelCounts={wallCounts[d.id] ?? {}}
                onBuildingChange={setBuilding}
                onWallChange={(level, count) => setWall(d.id, level, count)}
                dhLevel={districtHallDrafts[d.id] ?? 0}
                maxHallLevel={DISTRICT_MAX_LEVELS[d.id] ?? 5}
                onHallLevelChange={(level) => handleDistrictHallChange(d.id, level)}
                hallLabel="District Hall Level"
              />
            </TabItem>
          ))}

          <TabItem title="Troops">
            <ItemTab items={troopData} levelMap={troopLevels} onChange={setTroop} />
          </TabItem>

          <TabItem title="Spells">
            <ItemTab items={spellData} levelMap={spellLevels} onChange={setSpell} />
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
export default MassEditCapitalPage;
