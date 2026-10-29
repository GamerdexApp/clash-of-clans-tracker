"use client";

import Image from "next/image";
import { useState } from "react";
import { LuPencil, LuStar } from "react-icons/lu";
import type { TrackedAchievement } from "@/types/app/game";
import { formatNumber } from "@/lib/format";
import { achievementsText } from "@/lib/messages/achievements";
import { MAX_STARS, nextStarRewards } from "@/service/achievements";
import type { AchievementEdit } from "@/service/achievements";
import { Badge } from "@/comps/ui/Badge";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Checkbox } from "@/comps/ui/Checkbox";
import { CommitNumberInput } from "@/comps/ui/CommitNumberInput";
import { Field } from "@/comps/ui/Field";
import { IconButton } from "@/comps/ui/IconButton";
import { ProgressBar } from "@/comps/ui/ProgressBar";

const text = achievementsText.card;

const Stars = ({ stars }: { stars: number }) => (
	<span role="img" aria-label={text.starsEarned(stars)} className="flex gap-0.5">
		{Array.from({ length: MAX_STARS }, (_, index) => (
			<LuStar
				key={index}
				size={18}
				aria-hidden="true"
				className={index < stars ? "text-primary fill-current" : "text-line"}
			/>
		))}
	</span>
);

const RewardIcon = ({ src }: { src: string }) => (
	<Image
		src={src}
		alt=""
		width={16}
		height={16}
		style={{ width: 16, height: 16 }}
		className="object-contain"
	/>
);

interface AchievementCardProps {
	achievement: TrackedAchievement;
	onEdit: (edit: AchievementEdit) => void;
}

/** One achievement: its stars, progress and the next reward, with an editor that saves as you type. */
export const AchievementCard = ({ achievement, onEdit }: AchievementCardProps) => {
	const [editing, setEditing] = useState(false);
	const rewards = nextStarRewards(achievement);
	const maxed = achievement.stars >= MAX_STARS;
	const progress = achievement.target > 0 ? achievement.value / achievement.target : 0;

	return (
		<Card role="group" aria-label={achievement.name} className="flex flex-col gap-3 p-4">
			<div className="flex items-start justify-between gap-2">
				<div className="flex min-w-0 flex-col">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="font-semibold">{achievement.name}</h3>
						{achievement.isManual && <Badge tone="changed">{text.manual}</Badge>}
					</div>
					{achievement.info && (
						<span className="text-muted text-sm">{achievement.info}</span>
					)}
				</div>
				<IconButton
					label={text.edit(achievement.name)}
					onClick={() => setEditing(!editing)}
				>
					<LuPencil size={16} aria-hidden="true" />
				</IconButton>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Stars stars={achievement.stars} />
				{!maxed && rewards && (
					<span className="text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
						{text.nextStar}
						<span className="flex items-center gap-1">
							<RewardIcon src="/images/other/xp.png" />
							{formatNumber(rewards.xp)} {text.xp}
						</span>
						<span className="flex items-center gap-1">
							<RewardIcon src="/images/other/gem.png" />
							{formatNumber(rewards.gems)} {text.gems}
						</span>
					</span>
				)}
			</div>
			{maxed ? (
				<span className="text-kept font-mono">{formatNumber(achievement.value)}</span>
			) : (
				<div className="flex flex-col gap-1">
					<span className="font-mono text-sm">
						{formatNumber(achievement.value)} / {formatNumber(achievement.target)}
					</span>
					<ProgressBar value={progress} label={text.progress(achievement.name)} />
				</div>
			)}
			{editing && (
				<div className="border-line bg-tint flex flex-col gap-3 rounded-md border-[1.5px] p-3">
					<div className="flex flex-col gap-1">
						<span className="font-medium">{text.stars}</span>
						<div role="group" aria-label={text.stars} className="flex gap-1">
							{Array.from({ length: MAX_STARS }, (_, index) => {
								const filled = index < achievement.stars;
								return (
									<button
										key={index}
										type="button"
										aria-pressed={filled}
										aria-label={text.star(index + 1)}
										onClick={() =>
											onEdit({
												stars:
													achievement.stars === index + 1
														? index
														: index + 1,
											})
										}
										className="hover:bg-surface flex size-11 items-center justify-center rounded-md lg:size-9"
									>
										<LuStar
											size={22}
											aria-hidden="true"
											className={
												filled ? "text-primary fill-current" : "text-line"
											}
										/>
									</button>
								);
							})}
						</div>
						<span className="text-muted text-xs">{text.starsHelp}</span>
					</div>
					<div className="flex flex-wrap gap-3">
						<Field label={text.value}>
							<CommitNumberInput
								aria-label={text.value}
								value={achievement.value}
								onCommit={(value) => onEdit({ value })}
								className="w-32 font-mono"
							/>
						</Field>
						<Field label={text.target}>
							<CommitNumberInput
								aria-label={text.target}
								value={achievement.target}
								onCommit={(target) => onEdit({ target })}
								className="w-32 font-mono"
							/>
						</Field>
					</div>
					<Checkbox
						label={text.manualLabel}
						checked={achievement.isManual ?? false}
						onChange={(manual) => onEdit({ manual })}
					/>
					<p className="text-muted text-xs">{text.saves}</p>
					<div>
						<Button variant="primary" onClick={() => setEditing(false)}>
							{text.done}
						</Button>
					</div>
				</div>
			)}
		</Card>
	);
};
