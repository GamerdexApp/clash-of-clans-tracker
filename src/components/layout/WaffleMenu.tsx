"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HiViewGrid } from "react-icons/hi";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import type { AppItem } from "@/types/components/layout";

const APP_ITEMS: AppItem[] = [
  {
    id: "mass-edit-home",
    label: "Mass Edit Home Village",
    image: "/images/home/town-hall/normal/level-18.png",
    href: "/mass-edit",
  },
  {
    id: "mass-edit-builder",
    label: "Mass Edit Builder Base",
    image: "/images/builder/builder-hall/normal/level-10.png",
    href: "/mass-edit?scope=builder",
    minTH: 6,
  },
  {
    id: "mass-edit-capital",
    label: "Mass Edit Clan Capital",
    image: "/images/clan-capital/halls/capital-hall/normal/level-10.png",
    href: "/mass-edit?scope=capital",
    minTH: 3,
  },
  {
    id: "clan-mgmt",
    label: "Clan Mgmt",
    image: "/images/clan/badges/level-20.png",
    href: "#",
    disabled: true,
  },
  {
    id: "potion-boosts",
    label: "Potion Boosts",
    image: "/images/magic-items/potions/builder-potion.png",
    href: "#",
    disabled: true,
  },
  {
    id: "snack-boosts",
    label: "Snack Boosts",
    image: "/images/magic-items/snacks/builder-bite.png",
    href: "#",
    disabled: true,
  },
  {
    id: "season-pass",
    label: "Season Pass",
    image: "/images/season-pass/other/season-challenges-gold.png",
    href: "/season-pass",
    minTH: 7,
  },
  {
    id: "forge",
    label: "Forge",
    image: "/images/season-pass/pass-items/perk-auto-forge.png",
    href: "/forge",
    minTH: 6,
  },
  {
    id: "helpers",
    label: "Helpers",
    image: "/images/other/avatar-prospector.png",
    href: "/helpers",
    requiresHelperHut: true,
    lockedLabel: "Build Helper Hut",
  },
];

export const WaffleMenu = () => {
  const { activePlaythrough } = usePlaythrough();
  const thLevel = activePlaythrough?.data.homeVillage.townHallLevel ?? 0;
  const helperHutBuilt = (activePlaythrough?.data.homeVillage.armyBuildings["helper-hut"]?.[0]?.level ?? 0) > 0;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent)=> {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const activeItemClass =
    "flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-center transition-colors hover:bg-white/10 cursor-pointer";
  const disabledItemClass =
    "flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-center opacity-40 cursor-not-allowed";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-white transition-colors hover:bg-white/20 focus:outline-none"
        aria-label="Open app menu"
      >
        <HiViewGrid className="h-6 w-6" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-secondary/80 bg-primary shadow-xl">
          <div className="border-b border-secondary/80 px-4 py-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Apps</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-3">
            {APP_ITEMS.map((item) => {
              const thLocked = item.minTH !== undefined && thLevel < item.minTH;
              const hutLocked = !!item.requiresHelperHut && !helperHutBuilt;
              const isLocked = item.disabled || thLocked || hutLocked;
              const lockLabel = thLocked ? `TH ${item.minTH}` : (item.lockedLabel ?? "Soon");
              return isLocked ? (
                <div key={item.id} className={disabledItemClass} aria-disabled="true">
                  <img src={item.image} alt={item.label} className="h-10 object-contain" />
                  <span className="text-[11px] font-medium leading-tight text-white/80">
                    {item.label}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-accent/80">
                    {lockLabel}
                  </span>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={activeItemClass}
                >
                  <img src={item.image} alt={item.label} className="h-10 object-contain" />
                  <span className="text-[11px] font-medium leading-tight text-white/80">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
