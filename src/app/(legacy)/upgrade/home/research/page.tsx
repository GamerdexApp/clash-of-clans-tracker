"use client";

import { useMemo, useEffect } from "react";
import { usePersistedToggle } from "@/lib/hooks/usePersistedToggle";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TabItem, Tabs, ToggleSwitch } from "flowbite-react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { getTroopsAtTH, getSpellsAtTH, getSiegeMachinesAtTH } from "@/lib/utils/massEditHelpers";
import { getResearchUpgradeSteps, getResearchSlots, isActiveUpgrade } from "@/lib/utils/upgradeHelpers";
import {
  startResearchUpgrade,
  finishResearchUpgrade,
  cancelResearchUpgrade,
  adjustResearchUpgrade,
} from "@/lib/utils/upgradeActions";
import Image from "next/image";
import { massEditTabsTheme } from "@/lib/constants/massEditTheme";
import { UpgradeRow } from "@/components/upgrade/UpgradeRow";
import type { ResearchKey } from "@/types/app/game";

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

const ResearchUpgradePage = () => {
  const router = useRouter();
  const { activePlaythrough, appSettings, isLoaded, updatePlaythrough } = usePlaythrough();
  const researchBoostPct = (activePlaythrough?.dailies?.goldPass.researchBoostPct ?? 0) as 0 | 10 | 15 | 20;
  const [hideCompleted, setHideCompleted] = usePersistedToggle("upgrade:research:hideMax");

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const troops = useMemo(() => getTroopsAtTH(thLevel), [thLevel]);
  const spells = useMemo(() => getSpellsAtTH(thLevel), [thLevel]);
  const siege = useMemo(() => getSiegeMachinesAtTH(thLevel), [thLevel]);
  const slots = hv ? getResearchSlots(hv, appSettings.goblinResearchEnabled) : [];

  const save = (newHv: typeof hv)=> {
    if (!activePlaythrough || !newHv) return;
    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, homeVillage: newHv },
    });
  }

  const handleUnlock = (name: string, key: ResearchKey)=> {
    if (!activePlaythrough || !hv) return;
    const existing = hv[key] as { name: string; level: number }[];
    const updated = existing.some((t) => t.name === name)
      ? existing.map((t) => (t.name === name ? { ...t, level: 1 } : t))
      : [...existing, { name, level: 1 }];
    save({ ...hv, [key]: updated });
  }

  if (!activePlaythrough || !hv) return null;

  const countUpgrading = (key: ResearchKey): number => {
    return hv![key].filter(
      (item) => (item as any).upgrade && isActiveUpgrade((item as any).upgrade.finishesAt)
    ).length;
  }

  const renderSection = (key: ResearchKey, items: ReturnType<typeof getTroopsAtTH>, emptyLabel: string)=> {
    if (items.length === 0) {
      return (
        <p className="py-8 text-center text-sm text-gray-400">
          {emptyLabel} not yet available at TH{thLevel}.
        </p>
      );
    }
    const sorted = [...items].sort((a, b) => {
      const order = (r?: string) => r === "Dark Elixir" ? 1 : 0;
      return order(a.costResource) - order(b.costResource);
    });
    return (
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((item) => {
          const saved = hv![key].find((t) => t.name === item.name);
          const currentLevel = saved?.level ?? 0;

          if (currentLevel === 0) {
            return (
              <div key={item.name} className="overflow-hidden rounded-lg border border-secondary/80 bg-primary self-start">
                <div style={{ display: "grid", gridTemplateColumns: "112px 1px 1fr" }}>
                  <div className="flex items-center justify-center p-2">
                    {item.imageUrl ? (
                      <div className="relative h-20 w-20 opacity-50">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-contain" sizes="80px" />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded bg-secondary/20" />
                    )}
                  </div>
                  <div className="bg-secondary/80" />
                  <div className="flex flex-col justify-center gap-1.5 px-3 py-2">
                    <span className="text-sm font-bold text-white">{item.name}</span>
                    <span className="text-[11px] text-white/80">Not yet unlocked</span>
                    <button
                      type="button"
                      onClick={() => handleUnlock(item.name, key)}
                      className="mt-1 w-fit cursor-pointer rounded-md border border-white/20 bg-white/8 px-3 py-1 text-[11px] font-bold text-white/80 hover:bg-white/15 transition-colors"
                    >
                      Mark as Unlocked
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <UpgradeRow
              key={item.name}
              name={item.name}
              imageUrl={item.imageUrl}
              instances={[
                { currentLevel, maxLevel: item.maxLevel, upgradeState: saved?.upgrade },
              ]}
              getAllSteps={(level) => getResearchUpgradeSteps(item.name, level, thLevel)}
              slots={slots}
              hideIfComplete={hideCompleted}
              boostPct={researchBoostPct}
              onStartUpgrade={(_idx, step, builderId) =>
                save(startResearchUpgrade(hv!, key, item.name, step, builderId))
              }
              onFinishUpgrade={() => save(finishResearchUpgrade(hv!, key, item.name))}
              onCancelUpgrade={() => save(cancelResearchUpgrade(hv!, key, item.name))}
              onAdjustUpgrade={(_idx, finishesAt) =>
                save(adjustResearchUpgrade(hv!, key, item.name, finishesAt))
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
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Research</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Hide Max</span>
              <ToggleSwitch checked={hideCompleted} onChange={setHideCompleted} label="" />
            </div>
            <Link
              href="/upgrade/home/research/queue"
              className="rounded-lg bg-primary/80 px-3 py-1.5 text-xs font-bold text-accent hover:bg-primary"
            >
              Queue
            </Link>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 z-10 h-13 w-12 bg-linear-to-l from-highlight to-transparent" />
        <Tabs variant="pills" theme={massEditTabsTheme}>
          <TabItem title={<TabTitle label="Troops" count={countUpgrading("troops")} />}>
            {renderSection("troops", troops, "Troops")}
          </TabItem>
          <TabItem title={<TabTitle label="Spells" count={countUpgrading("spells")} />}>
            {renderSection("spells", spells, "Spells")}
          </TabItem>
          <TabItem title={<TabTitle label="Siege" count={countUpgrading("siegeMachines")} />}>
            {renderSection("siegeMachines", siege, "Siege Machines")}
          </TabItem>
        </Tabs>
      </div>
    </div>
  );
}
export default ResearchUpgradePage;
