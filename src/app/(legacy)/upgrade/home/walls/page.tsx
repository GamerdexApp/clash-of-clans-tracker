"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { getWallLevelsAtTH } from "@/lib/utils/massEditHelpers";
import { RiArrowRightLine } from "react-icons/ri";

const WallsUpgradePage = () => {
  const router = useRouter();
  const { activePlaythrough, isLoaded, updatePlaythrough } = usePlaythrough();
  const [customCounts, setCustomCounts] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const wallInfo = useMemo(() => getWallLevelsAtTH(thLevel), [thLevel]);

  if (!activePlaythrough || !hv) return null;

  const maxWallLevel = wallInfo.levels[wallInfo.levels.length - 1]?.level ?? 0;
  const allocated = Object.values(hv.walls).reduce((s, c) => s + c, 0);
  const remaining = wallInfo.totalAtTH - allocated;

  const lowestOccupied = wallInfo.levels.find((wl) => (hv.walls[String(wl.level)] ?? 0) > 0)?.level
    ?? wallInfo.levels[0]?.level
    ?? 0;
  const visibleLevels = wallInfo.levels.filter((wl) => wl.level >= lowestOccupied);

  const upgradeWalls = (fromLevel: number, count: number)=> {
    const fromCount = hv!.walls[String(fromLevel)] ?? 0;
    const actual = Math.min(count, fromCount);
    if (actual <= 0) return;

    const toLevel = fromLevel + 1;
    const newWalls = { ...hv!.walls };
    const newFrom = fromCount - actual;
    if (newFrom === 0) {
      delete newWalls[String(fromLevel)];
    } else {
      newWalls[String(fromLevel)] = newFrom;
    }
    newWalls[String(toLevel)] = (newWalls[String(toLevel)] ?? 0) + actual;

    updatePlaythrough(activePlaythrough!.id, {
      data: { ...activePlaythrough!.data, homeVillage: { ...hv!, walls: newWalls } },
    });
  }

  const handleCustomUpgrade = (level: number)=> {
    const raw = customCounts[level] ?? "";
    const count = parseInt(raw, 10);
    if (!count || count <= 0) return;
    upgradeWalls(level, count);
    setCustomCounts((prev) => ({ ...prev, [level]: "" }));
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Walls</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-3 flex items-center gap-4 rounded-xl border border-secondary/80 bg-highlight p-3">
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
            <span
              className={`text-xl font-extrabold ${
                remaining === 0 ? "text-green-600" : remaining < 0 ? "text-action" : "text-amber-600"
              }`}
            >
              {remaining}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Unallocated
            </span>
          </div>
        </div>

        <p className="mb-3 text-sm text-gray-900">
          Wall counts can also be adjusted in{" "}
          <Link href="/mass-edit/home" className="text-secondary underline">
            Mass Edit
          </Link>
          .
        </p>

        <div className="flex flex-col gap-2">
          {visibleLevels.map((wl) => {
            const count = hv.walls[String(wl.level)] ?? 0;
            const canUpgrade = count > 0 && wl.level < maxWallLevel;
            const customVal = customCounts[wl.level] ?? "";
            const customCount = parseInt(customVal, 10);
            const customValid = customCount > 0 && customCount <= count;

            return (
              <div
                key={wl.level}
                className="overflow-hidden rounded-lg border border-secondary/80 bg-primary"
              >
                <div className="flex items-center gap-3 px-3 py-2">
                  {wl.imageUrl && (
                    <div className="relative h-8 w-8 shrink-0">
                      <Image
                        src={wl.imageUrl}
                        alt={`Level ${wl.level} Wall`}
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                  )}
                  <span className="text-sm font-bold text-white">Level {wl.level}</span>
                  <span className="ml-auto text-sm font-bold text-white/80">
                    {count}
                    <span className="ml-1 text-[11px] font-normal text-white/80">segments</span>
                  </span>
                </div>

                {canUpgrade && (
                  <div className="flex items-center gap-2 border-t border-secondary/80 px-3 py-2">
                    <span className="flex items-center gap-0.5 text-[11px] text-white/80"><RiArrowRightLine size={11} /> Lvl {wl.level + 1}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => upgradeWalls(wl.level, 1)}
                        className="cursor-pointer rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20"
                      >
                        +1
                      </button>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={count}
                          value={customVal}
                          placeholder="N"
                          onChange={(e) =>
                            setCustomCounts((prev) => ({ ...prev, [wl.level]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && handleCustomUpgrade(wl.level)}
                          className="w-16 rounded-md border border-secondary/80 bg-primary/40 px-2 py-1 text-center text-[11px] text-white placeholder-white/80 focus:border-accent/80 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={!customValid}
                          onClick={() => handleCustomUpgrade(wl.level)}
                          className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                            customValid
                              ? "bg-white/10 text-white hover:bg-white/20"
                              : "cursor-not-allowed bg-secondary/20 text-white/80"
                          }`}
                        >
                          Upgrade
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default WallsUpgradePage;
