"use client";

import Image from "next/image";

import { builderText } from "@/lib/messages/builder";
import { commonText } from "@/lib/messages/common";
import { getHeroesAtTH } from "@/lib/utils/massEditHelpers";
import { readLevel } from "@/service/upgradeEngine";
import { upgradeSteps } from "@/service/upgradeSteps";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Masonry } from "@/comps/ui/Masonry";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import type { TabProps } from "@/types/components/builder";
import { TargetRow } from "./TargetRow";

export const HeroesTab = ({ village, hideMax, ...handlers }: TabProps) => {
	const heroes = getHeroesAtTH(village.data.homeVillage.townHallLevel);
	const targetFor = (name: string) => ({ kind: "hero" as const, name });
	const isMaxed = (name: string, maxLevel: number) =>
		readLevel(village, targetFor(name)) >= maxLevel && upgradeSteps(village, targetFor(name)).length === 0;

	if (heroes.length === 0) {
		return <EmptyState title={builderText.empty.title} description={commonText.heroesUnlock} />;
	}
	const shown = hideMax ? heroes.filter((hero) => !isMaxed(hero.name, hero.maxLevel)) : heroes;
	if (shown.length === 0) return <EmptyState title={builderText.empty.title} description={builderText.empty.allMax} />;

	return (
		<Masonry>
			{shown.map((hero) => (
				<Card key={hero.id} role="group" aria-label={hero.name} className="flex flex-col gap-3 p-4">
					<div className="flex items-start gap-3">
						{hero.imageUrl && (
							<Image
								src={hero.imageUrl}
								alt=""
								width={48}
								height={48}
								style={{ width: 48, height: 48 }}
								className="shrink-0 object-contain"
							/>
						)}
						<div className="flex min-w-0 flex-1 flex-col gap-1">
							<h3 className="truncate text-base font-semibold">{hero.name}</h3>
							<span className="text-muted text-xs">{builderText.card.maxAtHall(hero.maxLevel)}</span>
							<ProgressBar
								value={Math.min(1, readLevel(village, targetFor(hero.name)) / hero.maxLevel)}
								label={builderText.card.progress(hero.name)}
								tone="kept"
							/>
						</div>
					</div>
					<ul>
						<TargetRow
							village={village}
							target={targetFor(hero.name)}
							name={hero.name}
							maxLevel={hero.maxLevel}
							hideStepperAtZero={false}
							{...handlers}
						/>
					</ul>
				</Card>
			))}
		</Masonry>
	);
};
