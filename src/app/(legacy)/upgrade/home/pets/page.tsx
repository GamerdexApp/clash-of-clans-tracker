"use client";

import { useMemo, useEffect } from "react";
import { usePersistedToggle } from "@/lib/hooks/usePersistedToggle";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ToggleSwitch } from "flowbite-react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { getPetsAtTH } from "@/lib/utils/massEditHelpers";
import { getPetUpgradeSteps, getPetSlots } from "@/lib/utils/upgradeHelpers";
import { startPetUpgrade, finishPetUpgrade, cancelPetUpgrade, adjustPetUpgrade } from "@/lib/utils/upgradeActions";
import { UpgradeRow } from "@/components/upgrade/UpgradeRow";

const PetsUpgradePage = () => {
  const router = useRouter();
  const { activePlaythrough, isLoaded, updatePlaythrough } = usePlaythrough();
  const researchBoostPct = (activePlaythrough?.dailies?.goldPass.researchBoostPct ?? 0) as 0 | 10 | 15 | 20;
  const [hideCompleted, setHideCompleted] = usePersistedToggle("upgrade:pets:hideMax");

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const pets = useMemo(() => getPetsAtTH(thLevel), [thLevel]);
  const slots = hv ? getPetSlots(hv) : [];

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
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Pets</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Hide Max</span>
              <ToggleSwitch checked={hideCompleted} onChange={setHideCompleted} label="" />
            </div>
            <Link
              href="/upgrade/home/pets/queue"
              className="rounded-lg bg-primary/80 px-3 py-1.5 text-xs font-bold text-accent hover:bg-primary"
            >
              Queue
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {pets.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Pets unlock at TH14.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => {
              const saved = hv.pets.find((p) => p.name === pet.name);
              const currentLevel = saved?.level ?? 0;
              return (
                <UpgradeRow
                  key={pet.name}
                  name={pet.name}
                  imageUrl={pet.imageUrl}
                  instances={[
                    { currentLevel, maxLevel: pet.maxLevel, upgradeState: (saved as any)?.upgrade },
                  ]}
                  getAllSteps={(level) => getPetUpgradeSteps(pet.name, level)}
                  slots={slots}
                  hideIfComplete={hideCompleted}
                  boostPct={researchBoostPct}
                  onStartUpgrade={(_idx, step, builderId) =>
                    save(startPetUpgrade(hv, pet.name, step, builderId))
                  }
                  onFinishUpgrade={() => save(finishPetUpgrade(hv, pet.name))}
                  onCancelUpgrade={() => save(cancelPetUpgrade(hv, pet.name))}
                  onAdjustUpgrade={(_idx, finishesAt) =>
                    save(adjustPetUpgrade(hv, pet.name, finishesAt))
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
export default PetsUpgradePage;
