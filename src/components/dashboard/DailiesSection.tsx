"use client";

import Image from "next/image";
import Link from "next/link";
import { FaCheck, FaLock } from "react-icons/fa";
import { RiArrowRightLine } from "react-icons/ri";
import { useEffect, useRef, useState } from "react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { defaultDailies } from "@/service/defaultDailies";
import {
  isAvailable,
  msUntilNextReset,
  formatCountdown,
} from "@/lib/utils/dailyTimerHelpers";
import type { DailiesData, DailyTimerData, ForgeResourceType, GoldPassData, HelpersData } from "@/types/app/playthrough";
import type { AutoForgeChipProps, DailiesSectionProps, GoldPassItem, HelperTimerKey, TimerChipProps } from "@/types/components/dashboard";
import {
  getBuildersApprenticeData,
  getLabAssistantData,
  getHelperReduction,
  resolveAssignmentFinishesAt,
  applyHelperReduction,
} from "@/lib/utils/helperHelpers";

const getCurrentMonthKey = (): string  => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const TimerChip = ({ label, imageUrl, timer, onCollect, onAdjust }: TimerChipProps) => {
  const available = isAvailable(timer);
  const counting = !available && !!timer.resetTime;

  const [msLeft, setMsLeft] = useState<number>(() =>
    counting ? msUntilNextReset(timer.resetTime!) : 0
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!counting || !timer.resetTime) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const remaining = msUntilNextReset(timer.resetTime!);
      setMsLeft(remaining);
      if (remaining <= 0 && intervalRef.current) clearInterval(intervalRef.current);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [counting, timer.resetTime]);

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustValue, setAdjustValue] = useState(timer.resetTime ?? "");
  const [setupTime, setSetupTime] = useState("");

  const handleCollect = ()=> {
    if (!timer.resetTime && setupTime) {
      onCollect(setupTime);
      setSetupTime("");
    } else {
      onCollect(timer.resetTime);
    }
  }

  const handleAdjustConfirm = ()=> {
    if (adjustValue) onAdjust(adjustValue);
    setShowAdjust(false);
  }

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-18">
      <div
        className={`relative h-10 w-10 cursor-pointer transition-opacity ${available ? "opacity-100" : "opacity-60"}`}
        onClick={() => {
          if (available && timer.resetTime) handleCollect();
        }}
        title={available ? `Click to mark ${label} as used` : undefined}
      >
        <Image src={imageUrl} alt={label} fill sizes="40px" className="object-contain" />
        {available && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500">
            <FaCheck className="h-2 w-2 text-white" />
          </span>
        )}
      </div>

      <span className="text-[9px] font-bold uppercase tracking-wide text-white/80 text-center leading-tight">
        {label}
      </span>

      {!timer.resetTime ? (
        <div className="flex flex-col items-center gap-1 w-full">
          <input
            type="time"
            value={setupTime}
            onChange={(e) => setSetupTime(e.target.value)}
            className="w-full rounded border border-secondary/80 bg-white/10 px-1 py-0.5 text-[10px] text-white scheme-dark focus:outline-none focus:ring-1 focus:ring-accent/80 text-center"
          />
          <button
            type="button"
            onClick={handleCollect}
            className="cursor-pointer w-full rounded bg-accent px-1 py-0.5 text-[10px] font-bold text-primary hover:bg-accent/80"
          >
            Use
          </button>
        </div>
      ) : showAdjust ? (
        <div className="flex flex-col items-center gap-1 w-full">
          <input
            type="time"
            value={adjustValue}
            onChange={(e) => setAdjustValue(e.target.value)}
            className="w-full rounded border border-secondary/80 bg-white/10 px-1 py-0.5 text-[10px] text-white scheme-dark focus:outline-none focus:ring-1 focus:ring-accent/80 text-center"
          />
          <div className="flex gap-1 w-full">
            <button
              type="button"
              onClick={handleAdjustConfirm}
              className="cursor-pointer flex-1 rounded bg-accent px-1 py-0.5 text-[10px] font-bold text-primary hover:bg-accent/80"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAdjust(false)}
              className="cursor-pointer flex-1 rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/80 hover:bg-white/20"
            >
              ✕
            </button>
          </div>
        </div>
      ) : available ? (
        <div className="flex flex-col items-center gap-1 w-full">
          <button
            type="button"
            onClick={handleCollect}
            className="cursor-pointer w-full rounded bg-accent px-1 py-0.5 text-[10px] font-bold text-primary hover:bg-accent/80"
          >
            Use
          </button>
          <button
            type="button"
            onClick={() => { setAdjustValue(timer.resetTime ?? ""); setShowAdjust(true); }}
            className="cursor-pointer w-full rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/80 hover:bg-white/20"
          >
            Adjust
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 w-full">
          <span className="text-[10px] font-extrabold tabular-nums text-white/80 text-center">
            {formatCountdown(msLeft)}
          </span>
          <button
            type="button"
            onClick={() => { setAdjustValue(timer.resetTime ?? ""); setShowAdjust(true); }}
            className="cursor-pointer w-full rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/80 hover:bg-white/20"
          >
            Adjust
          </button>
        </div>
      )}
    </div>
  );
}


const LockedChip = ({ label, imageUrl }: { label: string; imageUrl: string }) => {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-18 opacity-40">
      <div className="relative h-10 w-10">
        <Image src={imageUrl} alt={label} fill sizes="40px" className="object-contain grayscale" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FaLock className="h-5 w-5 text-white drop-shadow" />
        </div>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wide text-white/80 text-center leading-tight">
        {label}
      </span>
      <span className="text-[9px] text-white/80">Locked</span>
    </div>
  );
}


const Divider = () => {
  return <div className="w-px self-stretch bg-secondary/80" />;
}


const GP_BASE = "images/season-pass/pass-items/";


const GoldPassDisplay = ({ goldPass }: { goldPass: GoldPassData }) => {
  const col1: GoldPassItem[] = [
    { type: "pct",  label: "Builder",     image: `${GP_BASE}perk-builder-boost.png`,          value: goldPass.builderBoostPct },
    { type: "pct",  label: "Research",    image: `${GP_BASE}perk-research-boost.png`,         value: goldPass.researchBoostPct },
    { type: "bool", label: "Hoggy Bank",  image: `${GP_BASE}hoggy-bank.png`,                  unlocked: goldPass.hoggyBankUnlocked },
  ];
  const col2: GoldPassItem[] = [
    { type: "bool", label: "1 Gem Dono",  image: `${GP_BASE}perk-1-gem-donations.png`,        unlocked: goldPass.gemDonationsUnlocked },
    { type: "bool", label: "Auto Forge",  image: `${GP_BASE}perk-auto-forge.png`,             unlocked: goldPass.autoForgeUnlocked },
    { type: "bool", label: "Req. Reduce", image: `${GP_BASE}perk-request-time-reduction.png`, unlocked: goldPass.requestTimeReductionUnlocked },
  ];

  const renderItem = (item: GoldPassItem, idx: number)=> {
    const locked = item.type === "bool" && !item.unlocked;
    return (
      <div key={idx} className={`flex items-center gap-1.5 ${locked ? "opacity-40" : ""}`}>
        <div className="relative h-6 w-6 shrink-0">
          <Image
            src={toPublicImageUrl(item.image)}
            alt={item.label}
            fill
            sizes="24px"
            className={`object-contain${locked ? " grayscale" : ""}`}
          />
        </div>
        <span className="text-[10px] text-white/80 leading-tight truncate">{item.label}</span>
        {item.type === "pct" ? (
          <span className="ml-auto text-[10px] font-extrabold text-accent shrink-0">{item.value}%</span>
        ) : item.unlocked ? (
          <FaCheck className="ml-auto h-3 w-3 shrink-0 text-accent" />
        ) : (
          <FaLock className="ml-auto h-3 w-3 shrink-0 text-white/80" />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Gold Pass</span>
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 w-28">{col1.map(renderItem)}</div>
        <div className="flex flex-col gap-2 w-28">{col2.map(renderItem)}</div>
      </div>
    </div>
  );
}



const RESOURCE_META: Record<ForgeResourceType, { label: string; image: string }> = {
  gold:          { label: "Gold",          image: "images/other/gold.png" },
  elixir:        { label: "Elixir",        image: "images/other/elixir.png" },
  darkElixir:    { label: "Dark Elixir",   image: "images/other/dark-elixir.png" },
  builderGold:   { label: "Builder Gold",  image: "images/other/gold-b.png" },
  builderElixir: { label: "Builder Elixir",image: "images/other/elixir-b.png" },
};


const formatMsDhm = (ms: number): string  => {
  const totalMins = Math.ceil(ms / 60_000);
  const d = Math.floor(totalMins / 1440);
  const h = Math.floor((totalMins % 1440) / 60);
  const m = totalMins % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || parts.length === 0) parts.push(`${m}m`);
  return parts.join(" ");
}

const AutoForgeChip = ({ autoForge, onStop }: AutoForgeChipProps) => {
  const [display, setDisplay] = useState(() =>
    autoForge.endsAt ? Math.max(0, new Date(autoForge.endsAt).getTime() - Date.now()) : 0
  );
  const isDone = !!autoForge.endsAt && display === 0;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!autoForge.endsAt) return;
    const remaining = Math.max(0, new Date(autoForge.endsAt).getTime() - Date.now());
    if (remaining <= 0) return;
    intervalRef.current = setInterval(() => {
      const r = Math.max(0, new Date(autoForge.endsAt!).getTime() - Date.now());
      setDisplay(r);
      if (r <= 0 && intervalRef.current) clearInterval(intervalRef.current);
    }, 60_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoForge.endsAt]);

  const resourceImg = RESOURCE_META[autoForge.resourceType].image;

  const conversionRow = autoForge.endsAt && (
    <div className="flex items-center gap-1">
      <div className="relative h-4 w-4 shrink-0">
        <Image src={toPublicImageUrl(resourceImg)} alt={RESOURCE_META[autoForge.resourceType].label} fill sizes="16px" className="object-contain" />
      </div>
      {autoForge.resourceAmount > 0 && (
        <span className="text-[9px] text-white/80">{autoForge.resourceAmount.toLocaleString()}</span>
      )}
      <RiArrowRightLine size={10} className="text-white/80 shrink-0" />
      <div className="relative h-4 w-4 shrink-0">
        <Image src={toPublicImageUrl("images/other/gold-c.png")} alt="Capital Gold" fill sizes="16px" className="object-contain" />
      </div>
      {autoForge.capitalGoldOutput > 0 && (
        <span className="text-[9px] font-bold text-accent">{autoForge.capitalGoldOutput.toLocaleString()}</span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-1.5 min-w-36">
      <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Auto Forge</span>
      {!autoForge.endsAt ? (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-white/80">Not running</span>
          <Link href="/forge" className="text-[10px] font-bold text-accent hover:underline">
            Go to Forge <RiArrowRightLine size={10} className="inline ml-0.5" />
          </Link>
        </div>
      ) : isDone ? (
        <div className="flex flex-col gap-1">
          {conversionRow}
          <span className="text-[11px] font-extrabold text-green-400">Done!</span>
          <button type="button" onClick={onStop}
            className="cursor-pointer w-full rounded bg-white/10 px-2 py-1 text-[10px] text-white/80 hover:bg-white/20">
            Reset
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {conversionRow}
          <span className="text-[11px] font-extrabold tabular-nums text-white">{formatMsDhm(display)}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onStop}
              className="cursor-pointer rounded bg-white/10 px-2 py-1 text-[10px] text-white/80 hover:bg-white/20">
              Stop
            </button>
            <Link href="/forge" className="text-[10px] font-bold text-accent hover:underline">
              Forge <RiArrowRightLine size={10} className="inline ml-0.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


const HELPER_CHIPS: { key: HelperTimerKey; label: string; image: string }[] = [
  { key: "buildersApprentice", label: "Builder's App", image: "images/home/other/helpers/builders-apprentice/normal.png" },
  { key: "labAssistant",       label: "Lab Asst",      image: "images/home/other/helpers/lab-assistant/normal.png" },
  { key: "alchemist",          label: "Alchemist",     image: "images/home/other/helpers/alchemist/normal.png" },
  { key: "prospector",         label: "Prospector",    image: "images/home/other/helpers/prospector/normal.png" },
];

const DAILY_CHIPS: { key: "starBonus" | "capitalGold"; label: string; image: string }[] = [
  { key: "starBonus",   label: "Star Bonus",    image: "images/season-pass/challenges/star-bonus.png" },
  { key: "capitalGold", label: "Capital Gold",  image: "images/other/gold-c.png" },
];

export const DailiesSection = ({ dailies, playthroughId, thLevel, helperHutLevel, hv }: DailiesSectionProps) => {
  const { updatePlaythrough, activePlaythrough } = usePlaythrough();

  const showHelpers = helperHutLevel > 0;
  const showStarBonus = thLevel >= 3;
  const showCapitalGold = thLevel >= 6;
  const showGoldPass = thLevel >= 7;
  const hasDailyChips = showStarBonus || showCapitalGold;

  // Auto-reset Gold Pass if month has changed
  useEffect(() => {
    const currentMonthKey = getCurrentMonthKey();
    if (dailies.goldPass.monthKey !== currentMonthKey) {
      updatePlaythrough(playthroughId, {
        dailies: {
          ...dailies,
          goldPass: { ...dailies.goldPass, builderBoostPct: 0, researchBoostPct: 0, monthKey: currentMonthKey },
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showHelpers && !hasDailyChips && !showGoldPass) return null;

  const updateHelper = (key: HelperTimerKey, patch: Partial<DailyTimerData>)=> {
    const existing = dailies.helpers[key] as DailyTimerData;
    updatePlaythrough(playthroughId, {
      dailies: {
        ...dailies,
        helpers: { ...dailies.helpers, [key]: { ...existing, ...patch } },
      },
    });
  }

  const updateDaily = (key: "starBonus" | "capitalGold", patch: Partial<DailyTimerData>)=> {
    updatePlaythrough(playthroughId, {
      dailies: { ...dailies, [key]: { ...dailies[key], ...patch } },
    });
  }

  const handleHelperCollect = (key: HelperTimerKey, resetTime: string | null)=> {
    const collectedAt = new Date();
    const timerPatch: Partial<DailyTimerData> = {
      lastCollectedAt: collectedAt.toISOString(),
      ...(resetTime !== null ? { resetTime } : {}),
    };

    if (key === "buildersApprentice" || key === "labAssistant") {
      const assignmentKey = key === "buildersApprentice" ? "buildersApprenticeAssignment" : "labAssistantAssignment";
      const levelKey = key === "buildersApprentice" ? "buildersApprenticeLevel" : "labAssistantLevel";
      const assignment = dailies.helpers[assignmentKey];
      const level = dailies.helpers[levelKey];

      if (assignment && level) {
        const levelData = key === "buildersApprentice"
          ? getBuildersApprenticeData().find((l) => l.level === level)
          : getLabAssistantData().find((l) => l.level === level);

        if (levelData) {
          const finishesAt = resolveAssignmentFinishesAt(hv, assignment.target);
          if (finishesAt) {
            const remaining = Math.max(0, new Date(finishesAt).getTime() - collectedAt.getTime());
            const savedMs = getHelperReduction(levelData.workRate, remaining);
            const newHv = savedMs > 0 ? applyHelperReduction(hv, assignment, savedMs) : hv;
            const helpersPatch: Partial<HelpersData> = { [key]: { ...dailies.helpers[key] as DailyTimerData, ...timerPatch } };
            if (assignment.mode === "once") helpersPatch[assignmentKey] = undefined;
            updatePlaythrough(playthroughId, {
              data: { ...activePlaythrough!.data, homeVillage: newHv },
              dailies: { ...dailies, helpers: { ...dailies.helpers, ...helpersPatch } },
            });
            return;
          }
        }
      }
    }

    updateHelper(key, timerPatch);
  }

  const handleDailyCollect = (key: "starBonus" | "capitalGold", resetTime: string | null)=> {
    updateDaily(key, {
      lastCollectedAt: new Date().toISOString(),
      ...(resetTime !== null ? { resetTime } : {}),
    });
  }

  return (
    <section className="mb-6">
      <div className="flex items-start gap-4 overflow-x-auto rounded-xl border border-secondary/80 bg-primary px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {showHelpers && (
          <>
            <div className="flex shrink-0 flex-col gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Helpers</span>
              <div className="flex gap-4">
                {HELPER_CHIPS.map(({ key, label, image }) =>
                  key === "prospector" && !dailies.helpers.prospectorUnlocked ? (
                    <LockedChip key={key} label={label} imageUrl={toPublicImageUrl(image)} />
                  ) : (
                    <TimerChip
                      key={key}
                      label={label}
                      imageUrl={toPublicImageUrl(image)}
                      timer={dailies.helpers[key]}
                      onCollect={(rt) => handleHelperCollect(key, rt)}
                      onAdjust={(rt) => updateHelper(key, { resetTime: rt })}
                    />
                  )
                )}
              </div>
            </div>
            {(hasDailyChips || showGoldPass) && <Divider />}
          </>
        )}

        {hasDailyChips && (
          <div className="flex shrink-0 flex-col gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Daily</span>
            <div className="flex gap-4">
              {DAILY_CHIPS.filter(({ key }) => (key === "starBonus" ? showStarBonus : showCapitalGold)).map(({ key, label, image }) => (
                <TimerChip
                  key={key}
                  label={label}
                  imageUrl={toPublicImageUrl(image)}
                  timer={dailies[key]}
                  onCollect={(rt) => handleDailyCollect(key, rt)}
                  onAdjust={(rt) => updateDaily(key, { resetTime: rt })}
                />
              ))}
            </div>
          </div>
        )}

        {showGoldPass && (
          <>
            {(showHelpers || hasDailyChips) && <Divider />}
            <div className="shrink-0">
              <GoldPassDisplay goldPass={dailies.goldPass} />
            </div>
            {dailies.goldPass.autoForgeUnlocked && (
              <>
                <Divider />
                <div className="shrink-0">
                  <AutoForgeChip
                    autoForge={dailies.autoForge}
                    onStop={() =>
                      updatePlaythrough(playthroughId, {
                        dailies: { ...dailies, autoForge: { ...dailies.autoForge, endsAt: null } },
                      })
                    }
                  />
                </div>
              </>
            )}
          </>
        )}

      </div>
    </section>
  );
}
