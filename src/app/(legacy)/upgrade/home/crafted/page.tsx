"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { getCraftedDefenses } from "@/lib/utils/massEditHelpers";

const CraftedUpgradePage = () => {
  const router = useRouter();
  const { activePlaythrough, isLoaded } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const craftedData = useMemo(() => (thLevel >= 18 ? getCraftedDefenses() : []), [thLevel]);

  if (!activePlaythrough || !hv) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Crafted Defenses</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {thLevel < 18 ? (
          <p className="py-8 text-center text-sm text-gray-400">Crafted Defenses unlock at TH18.</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-white/80">
              Crafted defense module levels are set in{" "}
              <Link href="/mass-edit/home" className="text-accent underline">
                Mass Edit
              </Link>
              .
            </p>
            <div className="flex flex-col gap-2">
              {craftedData.map((cd) => {
                const saved = hv.craftedDefenses[cd.id];
                return (
                  <div
                    key={cd.id}
                    className="overflow-hidden rounded-lg border border-secondary/80 bg-primary"
                  >
                    <div className="flex items-center gap-3 border-b border-secondary/80 px-3 py-2">
                      {cd.imageUrl && (
                        <div className="relative h-10 w-10 shrink-0">
                          <Image
                            src={cd.imageUrl}
                            alt={cd.name}
                            fill
                            className="object-contain"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <span className="font-bold text-white">{cd.name}</span>
                    </div>
                    <div className="divide-y divide-secondary/80">
                      {cd.modules.map((mod, mi) => {
                        const currentLevel = saved?.modules[mi] ?? 0;
                        return (
                          <div
                            key={mi}
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <span className="flex-1 text-sm text-white/80">{mod.name}</span>
                            <span className="text-sm text-white/80">
                              Lvl {currentLevel}
                              <span className="text-white/80"> / {mod.maxLevel}</span>
                            </span>
                            {currentLevel >= mod.maxLevel && (
                              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-bold text-accent">
                                Max
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default CraftedUpgradePage;
