"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { defaultDailies } from "@/lib/services/storage";
import {
  getForgeDurationMs,
  getForgeSlotCount,
  getForgeSlotUnlockTH,
  getForgeRates,
  getAutoForgeRates,
  type ConversionRate,
} from "@/lib/utils/forgeHelpers";
import { CapitalGoldCard } from "@/components/forge/CapitalGoldCard";
import { ForgeSlotRow } from "@/components/forge/ForgeSlotRow";
import { ConversionTables } from "@/components/forge/ConversionTables";
import type { DailiesData, ForgeResourceType, ForgeSlotData } from "@/types/app/playthrough";

const ForgePage = () => {
  const router = useRouter();
  const { activePlaythrough, updatePlaythrough } = usePlaythrough();

  useEffect(() => {
    if (activePlaythrough === null) {
      router.replace("/playthrough/list");
    }
  }, [activePlaythrough, router]);

  if (!activePlaythrough) return null;

  const { id: playthroughId, data, dailies: rawDailies } = activePlaythrough;
  const dailies: DailiesData = rawDailies ?? defaultDailies;
  const thLevel = data.homeVillage.townHallLevel;
  const bhLevel = data.builderBase.builderHallLevel;
  const slotCount = getForgeSlotCount(thLevel);
  const builderBoostPct = dailies.goldPass.builderBoostPct;
  const manualRates = getForgeRates(thLevel, bhLevel);

  const forgeSlots: ForgeSlotData[] = Array.from({ length: 4 }, (_, i) => {
    const existing = dailies.forgeSlots?.[i];
    return existing ?? { resourceType: null, endsAt: null, durationMs: 0, capitalGoldOutput: 0, resourceCost: 0 };
  });

  const updateDailies = (patch: Partial<DailiesData>)=> {
    updatePlaythrough(playthroughId, { dailies: { ...dailies, ...patch } });
  }

  const handleCapGoldCollect = (resetTime: string | null)=> {
    updateDailies({
      capitalGold: {
        ...dailies.capitalGold,
        lastCollectedAt: new Date().toISOString(),
        ...(resetTime !== null ? { resetTime } : {}),
      },
    });
  }

  const handleCapGoldAdjust = (newResetTime: string)=> {
    updateDailies({ capitalGold: { ...dailies.capitalGold, resetTime: newResetTime } });
  }

  const handleAutoStart = (resourceType: ForgeResourceType, rate: ConversionRate)=> {
    const durationMs = getForgeDurationMs(builderBoostPct);
    updateDailies({
      autoForge: {
        ...dailies.autoForge,
        endsAt: new Date(Date.now() + durationMs).toISOString(),
        resourceType,
        resourceAmount: rate.cost,
        capitalGoldOutput: rate.capitalGold,
        durationMs,
      },
    });
  }

  const handleAutoStop = ()=> {
    updateDailies({ autoForge: { ...dailies.autoForge, endsAt: null } });
  }

  const handleSlotStart = (index: number, resourceType: ForgeResourceType, rate: ConversionRate)=> {
    const durationMs = getForgeDurationMs(builderBoostPct);
    const newSlots = forgeSlots.map((s, i) =>
      i === index
        ? { ...s, endsAt: new Date(Date.now() + durationMs).toISOString(), resourceType, durationMs, capitalGoldOutput: rate.capitalGold, resourceCost: rate.cost }
        : s
    );
    updateDailies({ forgeSlots: newSlots });
  }

  const handleSlotStop = (index: number)=> {
    const newSlots = forgeSlots.map((s, i) =>
      i === index
        ? { ...s, endsAt: null, resourceType: null, durationMs: 0, capitalGoldOutput: 0, resourceCost: 0 }
        : s
    );
    updateDailies({ forgeSlots: newSlots });
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0">
          <Image
            src={toPublicImageUrl("images/season-pass/pass-items/perk-auto-forge.png")}
            alt="Forge"
            fill
            sizes="40px"
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-accent">Forge</h1>
          <p className="text-xs text-black">
            Capital Gold production — TH{thLevel}{bhLevel > 0 ? ` · BH${bhLevel}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-6 min-w-0 flex-1">
          <CapitalGoldCard
            timer={dailies.capitalGold}
            thLevel={thLevel}
            onCollect={handleCapGoldCollect}
            onAdjust={handleCapGoldAdjust}
          />

          <div className="rounded-xl border border-secondary/80 bg-primary overflow-hidden">
            <div className="px-4 py-3 border-b border-secondary/80">
              <h3 className="text-sm font-extrabold text-white">Forge Slots</h3>
              <p className="mt-0.5 text-[11px] text-white/80">
                3-day crafting time
                {builderBoostPct > 0 ? ` · ${builderBoostPct}% builder boost applied` : ""}
              </p>
            </div>

            <div className="divide-y divide-secondary/80">
              {dailies.goldPass.autoForgeUnlocked && (
                <ForgeSlotRow
                  label="Auto"
                  slot={dailies.autoForge}
                  isAuto
                  rates={getAutoForgeRates(thLevel, bhLevel)}
                  builderBoostPct={builderBoostPct}
                  thLevel={thLevel}
                  bhLevel={bhLevel}
                  onStart={handleAutoStart}
                  onStop={handleAutoStop}
                />
              )}

              {Array.from({ length: 4 }, (_, i) => {
                const slotIndex = i + 1;
                const isLocked = slotIndex > slotCount;
                return (
                  <ForgeSlotRow
                    key={i}
                    label={`Slot ${slotIndex}`}
                    slot={forgeSlots[i]}
                    locked={isLocked}
                    unlocksTH={isLocked ? getForgeSlotUnlockTH(slotIndex) : null}
                    rates={manualRates}
                    builderBoostPct={builderBoostPct}
                    thLevel={thLevel}
                    bhLevel={bhLevel}
                    onStart={(rt, rate) => handleSlotStart(i, rt, rate)}
                    onStop={() => handleSlotStop(i)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <ConversionTables
            thLevel={thLevel}
            bhLevel={bhLevel}
            autoForgeUnlocked={dailies.goldPass.autoForgeUnlocked}
          />
        </div>
      </div>
    </div>
  );
}
export default ForgePage;
