"use client";

import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from "flowbite-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { HiChartPie, HiChevronDown, HiChevronRight, HiCog, HiHome, HiStar, HiViewGrid } from "react-icons/hi";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useUI } from "@/lib/contexts/UIContext";
import {
  countActiveInRecord,
  countActiveHeroes,
  countActiveResearch,
  countActivePets,
  isActiveUpgrade,
} from "@/lib/utils/upgradeHelpers";
import { PlaythroughSwitcher } from "./PlaythroughSwitcher";

const UpgradeBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary">
      {count}
    </span>
  );
}

export const AppSidebar = () => {
  const pathname = usePathname();
  const { activePlaythrough } = usePlaythrough();
  const { sidebarOpen, setSidebarOpen } = useUI();
  const [hvExpanded, setHvExpanded] = useState(true);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 0;

  const builderBadge = hv
    ? countActiveInRecord(hv.defenses as any) +
      countActiveInRecord(hv.armyBuildings as any) +
      countActiveInRecord(hv.resourceBuildings as any) +
      countActiveInRecord(hv.traps as any) +
      countActiveHeroes(hv.heroes as any) +
      (hv.townHallUpgrade && isActiveUpgrade(hv.townHallUpgrade.finishesAt) ? 1 : 0) +
      (hv.townHallWeaponUpgrade && isActiveUpgrade(hv.townHallWeaponUpgrade.finishesAt) ? 1 : 0)
    : 0;
  const researchBadge = hv ? countActiveResearch(hv) : 0;
  const petBadge = hv ? countActivePets(hv) : 0;

  const blacksmithBuilt = (hv?.armyBuildings?.["blacksmith"]?.[0]?.level ?? 0) > 0;

  const hvItems = [
    { href: "/upgrade/home/builder",   label: "Builder",   badge: builderBadge,  show: true },
    { href: "/upgrade/home/research",  label: "Research",  badge: researchBadge, show: true },
    { href: "/upgrade/home/pets",      label: "Pets",      badge: petBadge,      show: thLevel >= 14 },
    { href: "/upgrade/home/equipment", label: "Equipment", badge: 0,             show: blacksmithBuilt },
    { href: "/upgrade/home/walls",     label: "Walls",     badge: 0,             show: true },
  ].filter((item) => item.show);

  return (
    <aside
      className={`fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 transform overflow-y-auto border-r border-secondary/80 bg-secondary transition-transform duration-300 ease-in-out md:static md:top-0 md:h-auto md:translate-x-0 dark:border-gray-700 dark:bg-gray-800 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <Sidebar aria-label="Sidebar navigation" className="h-full border-none bg-transparent">
        <div className="flex h-full flex-col">
          <PlaythroughSwitcher />

          <div className="mt-2 flex-1 overflow-y-auto">
            <SidebarItems>
              <SidebarItemGroup>
                <SidebarItem
                  as={Link}
                  href="/"
                  icon={HiHome}
                  active={pathname === "/"}
                  onClick={() => setSidebarOpen(false)}
                >
                  Home
                </SidebarItem>

                <SidebarItem
                  as={Link}
                  href="/villages"
                  icon={HiViewGrid}
                  active={pathname === "/villages"}
                  onClick={() => setSidebarOpen(false)}
                >
                  Villages
                </SidebarItem>

                {activePlaythrough && (
                  <SidebarItem
                    as={Link}
                    href="/dashboard"
                    icon={HiChartPie}
                    active={pathname === "/dashboard"}
                    onClick={() => setSidebarOpen(false)}
                  >
                    Dashboard
                  </SidebarItem>
                )}

                {activePlaythrough && (
                  <SidebarItem
                    as={Link}
                    href="/achievements"
                    icon={HiStar}
                    active={pathname === "/achievements"}
                    onClick={() => setSidebarOpen(false)}
                  >
                    Achievements
                  </SidebarItem>
                )}
              </SidebarItemGroup>

              {activePlaythrough && (
                <SidebarItemGroup>
                  <button
                    type="button"
                    onClick={() => setHvExpanded((v) => !v)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest text-accent/80 hover:bg-white/10"
                  >
                    {hvExpanded ? (
                      <HiChevronDown className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <HiChevronRight className="h-3.5 w-3.5 shrink-0" />
                    )}
                    Home Village
                  </button>

                  {hvExpanded && hvItems.map((item) => (
                    <SidebarItem
                      key={item.href}
                      as={Link}
                      href={item.href}
                      active={pathname === item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="pl-8"
                    >
                      <span className="flex w-full items-center">
                        {item.label}
                        <UpgradeBadge count={item.badge} />
                      </span>
                    </SidebarItem>
                  ))}
                </SidebarItemGroup>
              )}
            </SidebarItems>
          </div>

          <div>
            <ul>
              <li>
                <Link
                  href="/settings"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex cursor-pointer items-center justify-center rounded-lg p-2 text-sm font-normal text-white hover:bg-white/10 dark:text-white dark:hover:bg-white/10 ${pathname === "/settings" ? "bg-white/20 dark:bg-white/10" : ""}`}
                >
                  <HiCog className="h-6 w-6 shrink-0 text-white/80 transition duration-75" />
                  <span className="flex-1 px-3 whitespace-nowrap">Settings</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Sidebar>
    </aside>
  );
}
