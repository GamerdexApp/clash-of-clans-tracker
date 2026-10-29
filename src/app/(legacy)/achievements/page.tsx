"use client";

import Link from "next/link";
import { Button, Card } from "flowbite-react";
import { HiViewGrid } from "react-icons/hi";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { ProgressCard } from "@/comps/dashboard/ProgressCard";
import { StatCard } from "@/comps/achievements/StatCard";
import { AchievementSection } from "@/comps/achievements/AchievementSection";
import {
  mergeWithPackageList,
  calcVillageStarProgress,
  calcTotalGemsCollected,
  calcTotalXpAvailable,
} from "@/lib/utils/achievementHelpers";
import type { TrackedAchievement } from "@/types/app/game";

const AchievementsPage = () => {
  const { activePlaythrough, updatePlaythrough } = usePlaythrough();

  if (!activePlaythrough) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-white">No Active Village</h2>
          <p className="text-white/80">Select or create a village to see your achievements.</p>
          <Button as={Link} href="/playthrough/list" color="action">
            <HiViewGrid className="mr-2 h-5 w-5" />
            Go to Villages
          </Button>
        </Card>
      </div>
    );
  }

  const saved = activePlaythrough.data.achievements;
  const allAchievements = mergeWithPackageList(saved);

  const homeProgress = calcVillageStarProgress(allAchievements, "home");
  const builderProgress = calcVillageStarProgress(allAchievements, "builderBase");
  const capitalProgress = calcVillageStarProgress(allAchievements, "clanCapital");
  const { collected: gemsCollected, total: gemsTotal } = calcTotalGemsCollected(allAchievements);
  const gemsProgress = {
    current: gemsCollected,
    max: gemsTotal,
    pct: gemsTotal > 0 ? Math.floor((gemsCollected / gemsTotal) * 100) : 0,
  };
  const xpAvailable = calcTotalXpAvailable(allAchievements);

  const homeAchievements = allAchievements.filter((a) => a.village === "home");
  const builderAchievements = allAchievements.filter((a) => a.village === "builderBase");
  const capitalAchievements = allAchievements.filter((a) => a.village === "clanCapital");

  const handleUpdate = (name: string, village: string, updates: Partial<TrackedAchievement>) => {
    const idx = saved.findIndex((a) => a.name === name && a.village === village);
    let newAchievements: TrackedAchievement[];
    if (idx >= 0) {
      newAchievements = saved.map((a, i) => (i === idx ? { ...a, ...updates } : a));
    } else {
      newAchievements = [...saved, { name, village, stars: 0, value: 0, target: 0, ...updates }];
    }
    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, achievements: newAchievements },
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <ProgressCard label="Home Village" result={homeProgress} />
        <ProgressCard label="Builder Base" result={builderProgress} />
        <ProgressCard label="Clan Capital" result={capitalProgress} />
        <ProgressCard label="Gems Collected" result={gemsProgress} />
        <StatCard
          label="XP Available"
          value={xpAvailable.toLocaleString()}
          sub="remaining XP to collect"
        />
      </div>

      <AchievementSection title="Home Village" achievements={homeAchievements} onUpdate={handleUpdate} />
      <AchievementSection title="Builder Base" achievements={builderAchievements} onUpdate={handleUpdate} />
      <AchievementSection title="Clan Capital" achievements={capitalAchievements} onUpdate={handleUpdate} />
    </div>
  );
};

export default AchievementsPage;
