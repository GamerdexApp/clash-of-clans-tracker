import type { IconType } from "react-icons";
import {
  LuAward,
  LuCastle,
  LuDog,
  LuFlame,
  LuFlaskConical,
  LuHammer,
  LuHandHelping,
  LuLayoutDashboard,
  LuLayers,
  LuSettings,
  LuShield,
  LuSwords,
  LuTicket,
  LuWrench,
} from "react-icons/lu";

export const APP_NAME = "Clash of Clans Tracker";
export const HOME_HREF = "/";
export const VILLAGES_HREF = "/villages";

export type NavItemId =
  | "overview"
  | "achievements"
  | "builder"
  | "research"
  | "pets"
  | "equipment"
  | "walls"
  | "builderBaseUpgrades"
  | "builderBaseTroops"
  | "builderBaseWalls"
  | "districts"
  | "capitalTroops"
  | "forge"
  | "helpers"
  | "seasonPass"
  | "massEdit"
  | "settings";

export type NavGroupId = "homeVillage" | "builderBase" | "clanCapital" | "dailies" | "tools";

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  icon: IconType;
  /** Pages that sit under this item but not under its own path. */
  alsoActiveFor?: string[];
}

export interface NavGroup {
  id: NavGroupId | null;
  label?: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: null,
    items: [
      { id: "overview", label: "Overview", href: "/overview", icon: LuLayoutDashboard },
      { id: "achievements", label: "Achievements", href: "/achievements", icon: LuAward },
    ],
  },
  {
    id: "homeVillage",
    label: "Home Village",
    items: [
      { id: "builder", label: "Builder", href: "/builder", icon: LuHammer },
      { id: "research", label: "Research", href: "/research", icon: LuFlaskConical },
      { id: "pets", label: "Pets", href: "/pets", icon: LuDog },
      { id: "equipment", label: "Equipment", href: "/equipment", icon: LuShield },
      { id: "walls", label: "Walls", href: "/walls", icon: LuLayers },
    ],
  },
  {
    id: "builderBase",
    label: "Builder Base",
    items: [
      { id: "builderBaseUpgrades", label: "Upgrades", href: "/builder-base/upgrades", icon: LuHammer, alsoActiveFor: ["/builder-base/queue"] },
      { id: "builderBaseTroops", label: "Troops", href: "/builder-base/troops", icon: LuSwords },
      { id: "builderBaseWalls", label: "Walls", href: "/builder-base/walls", icon: LuLayers },
    ],
  },
  {
    id: "clanCapital",
    label: "Clan Capital",
    items: [
      { id: "districts", label: "Districts", href: "/clan-capital/districts", icon: LuCastle },
      { id: "capitalTroops", label: "Troops and spells", href: "/clan-capital/troops", icon: LuSwords },
    ],
  },
  {
    id: "dailies",
    label: "Dailies",
    items: [
      { id: "forge", label: "Forge", href: "/forge", icon: LuFlame },
      { id: "helpers", label: "Helpers", href: "/helpers", icon: LuHandHelping },
      { id: "seasonPass", label: "Season Pass", href: "/season-pass", icon: LuTicket },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    items: [{ id: "massEdit", label: "Mass edit", href: "/mass-edit", icon: LuWrench }],
  },
];

export const settingsNavItem: NavItem = {
  id: "settings",
  label: "Settings",
  href: "/settings",
  icon: LuSettings,
};

const allItems = [...navGroups.flatMap((group) => group.items), settingsNavItem];

export const isNavItemActive = (item: NavItem, pathname: string) =>
  [item.href, ...(item.alsoActiveFor ?? [])].some((href) => pathname === href || pathname.startsWith(`${href}/`));

const PAGES_OUTSIDE_SIDEBAR: Record<string, string> = { [VILLAGES_HREF]: "My Villages" };

export const getPageTitle = (pathname: string) =>
  allItems.find((item) => isNavItemActive(item, pathname))?.label ??
  PAGES_OUTSIDE_SIDEBAR[pathname] ??
  APP_NAME;

