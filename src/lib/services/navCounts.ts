import {
  countActiveHeroes,
  countActiveInRecord,
  countActivePets,
  countActiveResearch,
  isActiveUpgrade,
} from "@/lib/utils/upgradeHelpers";
import type { NavItemId } from "@/data/nav";
import type { Playthrough } from "@/types/app";

type NavCounts = Partial<Record<NavItemId, number>>;

/** Running upgrades per sidebar item. Builder counts every running upgrade, so it equals the sum of its tab badges. */
export const navCounts = (village: Playthrough): NavCounts => {
  const home = village.data.homeVillage;
  const townHallRunning = (upgrade?: { finishesAt: string }) =>
    upgrade && isActiveUpgrade(upgrade.finishesAt) ? 1 : 0;

  return {
    builder:
      countActiveInRecord(home.defenses) +
      countActiveInRecord(home.armyBuildings) +
      countActiveInRecord(home.resourceBuildings) +
      countActiveInRecord(home.traps) +
      countActiveHeroes(home.heroes) +
      townHallRunning(home.townHallUpgrade) +
      townHallRunning(home.townHallWeaponUpgrade),
    research: countActiveResearch(home),
    pets: countActivePets(home),
  };
};
