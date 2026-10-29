"use client";

import { builderBaseText } from "@/lib/messages/builderBase";
import { getBuilderHeroesAtBH } from "@/lib/utils/massEditBuilderHelpers";
import { readLevel } from "@/service/upgradeEngine";
import { upgradeSteps } from "@/service/upgradeSteps";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Masonry } from "@/comps/ui/Masonry";
import { ItemCard } from "@/comps/upgrades/ItemCard";
import type { UpgradeTarget } from "@/types/app/engine";
import type { TabProps } from "@/types/components/builder";

const text = builderBaseText;

export const BuilderBaseHeroesTab = ({ village, hideMax, ...handlers }: TabProps) => {
	const heroes = getBuilderHeroesAtBH(village.data.builderBase.builderHallLevel);
	const targetFor = (name: string): UpgradeTarget => ({ kind: "bbHero", name });
	const isMaxed = (name: string) =>
		readLevel(village, targetFor(name)) > 0 && upgradeSteps(village, targetFor(name)).length === 0;

	if (heroes.length === 0) return <EmptyState title={text.empty.title} description={text.empty.description} />;
	const shown = hideMax ? heroes.filter((hero) => !isMaxed(hero.name)) : heroes;
	if (shown.length === 0) return <EmptyState title={text.empty.title} description={text.empty.allMax} />;

	return (
		<Masonry>
			{shown.map((hero) => (
				<ItemCard
					key={hero.id}
					village={village}
					target={targetFor(hero.name)}
					name={hero.name}
					maxLevel={hero.maxLevel}
					imageUrl={hero.imageUrl}
					maxLabel={text.heroes.maxAtHall(hero.maxLevel)}
					progressLabel={text.heroes.progress(hero.name)}
					hideStepperAtZero={false}
					{...handlers}
				/>
			))}
		</Masonry>
	);
};
