"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ToggleSwitch } from "flowbite-react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { getAllEquipment, getHeroesAtTH } from "@/lib/utils/massEditHelpers";
import { getEquipmentUpgradeSteps } from "@/lib/utils/upgradeHelpers";
import { usePersistedToggle } from "@/lib/hooks/usePersistedToggle";
import { RiArrowRightLine } from "react-icons/ri";

const ORE_ICONS: Record<string, string> = {
  shiny: "/images/other/ore/shiny-ore.png",
  glowy: "/images/other/ore/glowy-ore.png",
  starry: "/images/other/ore/starry-ore.png",
};

const OreCost = ({ icon, amount, highlight }: { icon: string; amount: number; highlight?: boolean }) => {
  if (amount <= 0) return null;
  return (
    <span className="flex items-center gap-0.5">
      <span className="relative inline-block h-3.5 w-3.5 shrink-0">
        <Image src={icon} alt="" fill className="object-contain" sizes="14px" />
      </span>
      <span className={`text-[10px] font-medium ${highlight ? "text-amber-400" : "text-white/90"}`}>
        {amount.toLocaleString()}
      </span>
    </span>
  );
}

const EquipmentUpgradePage = () => {
  const router = useRouter();
  const { activePlaythrough, isLoaded, updatePlaythrough } = usePlaythrough();
  const [hideMax, setHideMax] = usePersistedToggle("upgrade:equipment:hideMax");
  const [selectedHero, setSelectedHero] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const heroes = useMemo(() => getHeroesAtTH(thLevel), [thLevel]);
  const allEquipment = useMemo(() => getAllEquipment(), []);

  if (!activePlaythrough || !hv) return null;

  const upgradeEquipment = (heroName: string, equipName: string, toLevel: number)=> {
    const newHeroes = hv!.heroes.map((hero) => {
      if (hero.name !== heroName) return hero;
      const newEquip = (hero.equipment ?? []).map((eq) =>
        eq.name === equipName ? { ...eq, level: toLevel } : eq
      );
      if (!newEquip.find((eq) => eq.name === equipName)) {
        newEquip.push({ name: equipName, level: toLevel });
      }
      return { ...hero, equipment: newEquip };
    });
    updatePlaythrough(activePlaythrough!.id, {
      data: { ...activePlaythrough!.data, homeVillage: { ...hv!, heroes: newHeroes } },
    });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Equipment</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">Hide Max</span>
            <ToggleSwitch checked={hideMax} onChange={setHideMax} label="" />
          </div>
        </div>
        {heroes.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedHero(null)}
              className={`rounded-full px-3 py-1 text-[10px] font-bold cursor-pointer transition-colors border ${
                selectedHero === null
                  ? "bg-primary/80 border-accent/40 text-white"
                  : "bg-white/6 border-white/10 text-gray-600 hover:bg-white/10"
              }`}
            >
              All
            </button>
            {heroes.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedHero(selectedHero === h.name ? null : h.name)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold cursor-pointer transition-colors border ${
                  selectedHero === h.name
                    ? "bg-primary/80 border-accent/40 text-white"
                    : "bg-white/6 border-white/10 text-gray-600 hover:bg-white/10"
                }`}
              >
                {h.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-5">
          {heroes.filter((h) => !selectedHero || h.name === selectedHero).map((h) => {
            const heroEquip = allEquipment.filter((e) => e.heroId === h.id);
            if (heroEquip.length === 0) return null;
            const savedHero = hv.heroes.find((hero) => hero.name === h.name);

            const visibleEquip = heroEquip.filter((eq) => {
              if (!hideMax) return true;
              const currentLevel = savedHero?.equipment?.find((e) => e.name === eq.name)?.level ?? 0;
              return currentLevel < eq.maxLevel;
            });
            if (visibleEquip.length === 0) return null;

            return (
              <div key={h.id}>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-secondary/80">
                  {h.name}
                </p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {visibleEquip.map((eq) => {
                    const currentLevel = savedHero?.equipment?.find((e) => e.name === eq.name)?.level ?? 0;
                    const steps = getEquipmentUpgradeSteps(eq.name, currentLevel);
                    const atMax = currentLevel >= eq.maxLevel;

                    // cumulative remaining costs
                    let totalShiny = 0, totalGlowy = 0, totalStarry = 0;
                    steps.forEach((s) => { totalShiny += s.shinyOre; totalGlowy += s.glowyOre; totalStarry += s.starryOre; });

                    return (
                      <div key={eq.name} className="overflow-hidden rounded-lg border border-secondary/80 bg-primary self-start">
                        <div className="flex items-center gap-3 border-b border-secondary/80 px-3 py-2">
                          {eq.imageUrl && (
                            <div className="relative h-9 w-9 shrink-0">
                              <Image src={eq.imageUrl} alt={eq.name} fill className="object-contain" sizes="36px" />
                            </div>
                          )}
                          <span className="flex-1 text-sm font-bold text-white">{eq.name}</span>
                          <span className="text-xs text-white/80">
                            {currentLevel}<span className="text-white/80">/{eq.maxLevel}</span>
                          </span>
                          {atMax && (
                            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">Max</span>
                          )}
                        </div>

                        {steps.length > 0 && (
                          <div className="grid grid-cols-3 gap-1.5 p-2">
                            {steps.map((step, si) => (
                              <div key={step.level} className="flex flex-col gap-1 rounded-md border border-white/80 bg-white/5 p-2">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-white/80"><RiArrowRightLine size={10} /> Lv {step.level}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  <OreCost icon={ORE_ICONS.shiny} amount={step.shinyOre} />
                                  <OreCost icon={ORE_ICONS.glowy} amount={step.glowyOre} />
                                  <OreCost icon={ORE_ICONS.starry} amount={step.starryOre} />
                                </div>
                                {si === 0 && (
                                  <button
                                    type="button"
                                    onClick={() => upgradeEquipment(h.name, eq.name, step.level)}
                                    className="mt-0.5 cursor-pointer rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-primary hover:bg-accent/80"
                                  >
                                    Upgrade
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {steps.length > 0 && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-secondary/80 px-3 py-2">
                            <span className="text-[11px] text-white/80">{steps.length} levels</span>
                            {totalShiny > 0 && (
                              <span className="flex items-center gap-1">
                                <span className="relative inline-block h-3.5 w-3.5 shrink-0">
                                  <Image src={ORE_ICONS.shiny} alt="Shiny Ore" fill className="object-contain" sizes="14px" />
                                </span>
                                <span className="text-[11px] text-white/80">{totalShiny.toLocaleString()}</span>
                              </span>
                            )}
                            {totalGlowy > 0 && (
                              <span className="flex items-center gap-1">
                                <span className="relative inline-block h-3.5 w-3.5 shrink-0">
                                  <Image src={ORE_ICONS.glowy} alt="Glowy Ore" fill className="object-contain" sizes="14px" />
                                </span>
                                <span className="text-[11px] text-white/80">{totalGlowy.toLocaleString()}</span>
                              </span>
                            )}
                            {totalStarry > 0 && (
                              <span className="flex items-center gap-1">
                                <span className="relative inline-block h-3.5 w-3.5 shrink-0">
                                  <Image src={ORE_ICONS.starry} alt="Starry Ore" fill className="object-contain" sizes="14px" />
                                </span>
                                <span className="text-[11px] text-white/80">{totalStarry.toLocaleString()}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default EquipmentUpgradePage;
