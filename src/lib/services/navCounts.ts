import { countActivePets, countActiveResearch } from "@/lib/utils/upgradeHelpers";
import { runningUpgrades } from "@/service/upgradeEngine";
import type { NavItemId } from "@/data/nav";
import type { Playthrough } from "@/types/app";

type NavCounts = Partial<Record<NavItemId, number>>;

/** Builder counts every running upgrade, so it always equals the sum of the tab badges. */
export const navCounts = (village: Playthrough): NavCounts => ({
  builder: runningUpgrades(village).length,
  research: countActiveResearch(village.data.homeVillage),
  pets: countActivePets(village.data.homeVillage),
});
