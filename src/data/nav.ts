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
import { navText } from "@/lib/messages/nav";

export const APP_NAME = "Clash of Clans Tracker";
export const HOME_HREF = "/";
export const VILLAGES_HREF = "/villages";
export const SYNC_HREF = "/settings?tab=sync";

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
      {
        id: "overview",
        get label() {
          return navText.items.overview;
        },
        href: "/overview",
        icon: LuLayoutDashboard,
      },
      {
        id: "achievements",
        get label() {
          return navText.items.achievements;
        },
        href: "/achievements",
        icon: LuAward,
      },
    ],
  },
  {
    id: "homeVillage",
    get label() {
      return navText.groups.homeVillage;
    },
    items: [
      {
        id: "builder",
        get label() {
          return navText.items.builder;
        },
        href: "/builder",
        icon: LuHammer,
      },
      {
        id: "research",
        get label() {
          return navText.items.research;
        },
        href: "/research",
        icon: LuFlaskConical,
      },
      {
        id: "pets",
        get label() {
          return navText.items.pets;
        },
        href: "/pets",
        icon: LuDog,
      },
      {
        id: "equipment",
        get label() {
          return navText.items.equipment;
        },
        href: "/equipment",
        icon: LuShield,
      },
      {
        id: "walls",
        get label() {
          return navText.items.walls;
        },
        href: "/walls",
        icon: LuLayers,
      },
    ],
  },
  {
    id: "builderBase",
    get label() {
      return navText.groups.builderBase;
    },
    items: [
      {
        id: "builderBaseUpgrades",
        get label() {
          return navText.items.builderBaseUpgrades;
        },
        href: "/builder-base/upgrades",
        icon: LuHammer,
        alsoActiveFor: ["/builder-base/queue"],
      },
      {
        id: "builderBaseTroops",
        get label() {
          return navText.items.builderBaseTroops;
        },
        href: "/builder-base/troops",
        icon: LuSwords,
      },
      {
        id: "builderBaseWalls",
        get label() {
          return navText.items.builderBaseWalls;
        },
        href: "/builder-base/walls",
        icon: LuLayers,
      },
    ],
  },
  {
    id: "clanCapital",
    get label() {
      return navText.groups.clanCapital;
    },
    items: [
      {
        id: "districts",
        get label() {
          return navText.items.districts;
        },
        href: "/clan-capital/districts",
        icon: LuCastle,
      },
      {
        id: "capitalTroops",
        get label() {
          return navText.items.capitalTroops;
        },
        href: "/clan-capital/troops",
        icon: LuSwords,
      },
    ],
  },
  {
    id: "dailies",
    get label() {
      return navText.groups.dailies;
    },
    items: [
      {
        id: "forge",
        get label() {
          return navText.items.forge;
        },
        href: "/forge",
        icon: LuFlame,
      },
      {
        id: "helpers",
        get label() {
          return navText.items.helpers;
        },
        href: "/helpers",
        icon: LuHandHelping,
      },
      {
        id: "seasonPass",
        get label() {
          return navText.items.seasonPass;
        },
        href: "/season-pass",
        icon: LuTicket,
      },
    ],
  },
  {
    id: "tools",
    get label() {
      return navText.groups.tools;
    },
    items: [
      {
        id: "massEdit",
        get label() {
          return navText.items.massEdit;
        },
        href: "/mass-edit",
        icon: LuWrench,
      },
    ],
  },
];

export const settingsNavItem: NavItem = {
  id: "settings",
  get label() {
    return navText.items.settings;
  },
  href: "/settings",
  icon: LuSettings,
};

export const allNavItems: NavItem[] = [...navGroups.flatMap((group) => group.items), settingsNavItem];
const allItems = allNavItems;

export const isNavItemActive = (item: NavItem, pathname: string) =>
  [item.href, ...(item.alsoActiveFor ?? [])].some((href) => pathname === href || pathname.startsWith(`${href}/`));

export const getPageTitle = (pathname: string) =>
  allItems.find((item) => isNavItemActive(item, pathname))?.label ??
  (pathname === VILLAGES_HREF ? navText.villages : undefined) ??
  APP_NAME;

