"use client";

import type { Playthrough } from "@/types/app";
import { formatNumber } from "@/lib/format";
import { useAchievementActions } from "@/lib/hooks/useAchievementActions";
import { achievementsText } from "@/lib/messages/achievements";
import {
	achievementList,
	achievementsOf,
	areaProgress,
	rewardTotals,
	starProgress,
} from "@/service/achievements";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { SummaryTile } from "@/comps/ui/SummaryTile";
import { AchievementSection } from "./AchievementSection";

const text = achievementsText;

const AchievementsView = ({ village }: { village: Playthrough }) => {
	const actions = useAchievementActions(village);
	const list = achievementList(village);
	const all = starProgress(list);
	const rewards = rewardTotals(list);
	const tile = (label: string, area: "home" | "builderBase" | "clanCapital") => {
		const progress = areaProgress(list, area);
		return (
			<SummaryTile
				label={label}
				value={`${progress.percent}%`}
				caption={text.tiles.stars(progress.stars, progress.maxStars)}
			/>
		);
	};

	return (
		<>
			<PageHeader
				title={text.title}
				subline={text.subline(
					village.name,
					list.length,
					all.stars,
					all.maxStars,
					all.percent
				)}
			/>
			<div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
				<SummaryTile
					label={text.tiles.all}
					value={`${all.percent}%`}
					caption={text.tiles.stars(all.stars, all.maxStars)}
					emphasis
				/>
				{tile(text.tiles.home, "home")}
				{tile(text.tiles.builder, "builderBase")}
				{tile(text.tiles.capital, "clanCapital")}
				<SummaryTile
					label={text.tiles.gems}
					value={formatNumber(rewards.gems.earned)}
					total={formatNumber(rewards.gems.total)}
					caption={text.tiles.left(
						formatNumber(rewards.gems.total - rewards.gems.earned),
						text.tiles.gemsUnit
					)}
				/>
				<SummaryTile
					label={text.tiles.xp}
					value={formatNumber(rewards.xp.earned)}
					total={formatNumber(rewards.xp.total)}
					caption={text.tiles.left(
						formatNumber(rewards.xp.total - rewards.xp.earned),
						text.tiles.xpUnit
					)}
				/>
			</div>
			{(
				[
					{ area: "home", title: text.sections.home },
					{ area: "builderBase", title: text.sections.builderBase },
					{ area: "clanCapital", title: text.sections.clanCapital },
				] as const
			).map(({ area, title }) => (
				<AchievementSection
					key={area}
					title={title}
					achievements={achievementsOf(list, area)}
					progress={areaProgress(list, area)}
					rewards={rewardTotals(achievementsOf(list, area))}
					onEdit={actions.edit}
				/>
			))}
		</>
	);
};

export const AchievementsPage = () => (
	<VillageGate title={text.title}>
		{(village) => <AchievementsView village={village} />}
	</VillageGate>
);
