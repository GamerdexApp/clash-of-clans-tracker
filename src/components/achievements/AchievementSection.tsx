"use client";

import { useState } from "react";
import type { TrackedAchievement } from "@/types/app/game";
import { formatNumber } from "@/lib/format";
import { achievementsText } from "@/lib/messages/achievements";
import type { RewardTotals, StarProgress } from "@/service/achievements";
import type { AchievementEdit } from "@/service/achievements";
import { Button } from "@/comps/ui/Button";
import { Masonry } from "@/comps/ui/Masonry";
import { Section } from "@/comps/ui/Section";
import { AchievementCard } from "./AchievementCard";

const text = achievementsText.sections;
const FIRST_SHOWN = 12;

interface AchievementSectionProps {
	title: string;
	achievements: TrackedAchievement[];
	progress: StarProgress;
	/** Gems and XP the section's stars give, earned out of possible. */
	rewards: { gems: RewardTotals; xp: RewardTotals };
	onEdit: (achievement: TrackedAchievement, edit: AchievementEdit) => void;
}

/** A collapsible group of achievement cards. A long group shows its first cards and a button for the rest. */
export const AchievementSection = ({
	title,
	achievements,
	progress,
	rewards,
	onEdit,
}: AchievementSectionProps) => {
	const [expanded, setExpanded] = useState(false);
	const shown = expanded ? achievements : achievements.slice(0, FIRST_SHOWN);
	const hidden = achievements.length - shown.length;

	return (
		<Section
			title={title}
			description={text.summary(
				achievements.length,
				progress.stars,
				progress.maxStars,
				`${formatNumber(rewards.gems.earned)} / ${formatNumber(rewards.gems.total)}`,
				`${formatNumber(rewards.xp.earned)} / ${formatNumber(rewards.xp.total)}`
			)}
		>
			<Masonry>
				{shown.map((achievement) => (
					<AchievementCard
						key={`${achievement.village}::${achievement.name}`}
						achievement={achievement}
						onEdit={(edit) => onEdit(achievement, edit)}
					/>
				))}
			</Masonry>
			{achievements.length > FIRST_SHOWN && (
				<div>
					<Button onClick={() => setExpanded(!expanded)}>
						{expanded ? text.less : text.more(hidden, title)}
					</Button>
				</div>
			)}
		</Section>
	);
};
