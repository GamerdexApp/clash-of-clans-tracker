"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { getHeroesAtTH } from "@/lib/utils/massEditHelpers";
import { getHeroUpgradeSteps, getBuilderSlots } from "@/lib/utils/upgradeHelpers";
import { startHeroUpgrade, finishHeroUpgrade, cancelHeroUpgrade, adjustHeroUpgrade } from "@/lib/utils/upgradeActions";
import { UpgradeRow } from "@/components/upgrade/UpgradeRow";

const HeroesUpgradePage = () => {
  const router = useRouter();
  const { activePlaythrough, appSettings, isLoaded, updatePlaythrough } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const heroes = useMemo(() => getHeroesAtTH(thLevel), [thLevel]);
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
          <h1 className="text-xl font-extrabold text-gray-900">Heroes</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {heroes.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No heroes available at TH{thLevel}.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {heroes.map((h) => {
              const saved = hv.heroes.find((hero) => hero.name === h.name);
              const currentLevel = saved?.level ?? 0;
              return (
                <UpgradeRow
                  key={h.id}
                  name={h.name}
                  imageUrl={h.imageUrl}
                  instances={[{ currentLevel, maxLevel: h.maxLevel, upgradeState: saved?.upgrade }]}
                  getAllSteps={(level) => getHeroUpgradeSteps(h.id, level, thLevel)}
                  slots={slots}
                  onStartUpgrade={(_idx, step, builderId) =>
                    save(startHeroUpgrade(hv, h.name, step, builderId))
                  }
                  onFinishUpgrade={() => save(finishHeroUpgrade(hv, h.name))}
                  onCancelUpgrade={() => save(cancelHeroUpgrade(hv, h.name))}
                  onAdjustUpgrade={(_idx, finishesAt) =>
                    save(adjustHeroUpgrade(hv, h.name, finishesAt))
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
export default HeroesUpgradePage;
