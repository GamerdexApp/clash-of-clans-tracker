"use client";

import { Suspense, useState } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useEquipmentActions } from "@/lib/hooks/useEquipmentActions";
import { equipmentText } from "@/lib/messages/equipment";
import { getHeroesAtTH } from "@/lib/utils/massEditHelpers";
import {
  blacksmithLevel,
  equipmentForHero,
  equipmentLevel,
  oreStockOf,
  remainingSteps,
  totalOre,
} from "@/service/equipment";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { ButtonLink } from "@/comps/ui/Button";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Masonry } from "@/comps/ui/Masonry";
import { HideMaxToggle } from "@/comps/upgrades/HideMaxToggle";
import { MassEditLink } from "@/comps/upgrades/MassEditLink";
import type { Playthrough } from "@/types/app";
import type { OreAmounts } from "@/types/app/equipment";
import { EquipmentCard } from "./EquipmentCard";
import { OreStockCard } from "./OreStockCard";

const text = equipmentText;

const chipClasses = (selected: boolean) =>
	`min-h-11 rounded-full border-[1.5px] px-3 text-sm lg:min-h-9 ${
		selected ? "border-primary bg-primary text-on-primary" : "border-line bg-surface"
	}`;

const EquipmentContent = ({ village }: { village: Playthrough }) => {
	const { appSettings, updateSettings } = usePlaythrough();
	const actions = useEquipmentActions(village);
	const [selectedHero, setSelectedHero] = useState<string | null>(null);

	const townHall = village.data.homeVillage.townHallLevel;
	const blacksmith = blacksmithLevel(village);
	const hideMax = appSettings.ui?.hideMax ?? false;
	const heroes = getHeroesAtTH(townHall);

	const sections = heroes
		.filter((hero) => !selectedHero || hero.name === selectedHero)
		.map((hero) => {
			const pieces = equipmentForHero(hero.id).map((piece) => ({
				piece,
				level: equipmentLevel(village, hero.name, piece.name),
			}));
			const listed = hideMax ? pieces.filter(({ piece, level }) => level < piece.maxLevel) : pieces;
			return { hero, all: pieces, listed };
		})
		.filter((section) => section.listed.length > 0);

	const needed: OreAmounts = sections
		.flatMap((section) => section.listed)
		.reduce(
			(sum, { piece, level }) => {
				const ore = totalOre(remainingSteps(piece, level));
				return { shiny: sum.shiny + ore.shiny, glowing: sum.glowing + ore.glowing, starry: sum.starry + ore.starry };
			},
			{ shiny: 0, glowing: 0, starry: 0 },
		);

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, townHall, blacksmith)} />
			<MassEditLink hint={text.massEdit} tab="equipment" />
			<OreStockCard
				stock={oreStockOf(village)}
				needed={needed}
				deduct={actions.deductOre}
				onStockChange={actions.setOre}
				onDeductChange={actions.setDeductOre}
			/>
			<div className="flex flex-wrap items-center justify-between gap-3">
				{heroes.length > 1 && (
					<div role="group" aria-label={text.heroFilter} className="flex flex-wrap gap-2">
						<button type="button" aria-pressed={selectedHero === null} onClick={() => setSelectedHero(null)} className={chipClasses(selectedHero === null)}>
							{text.allHeroes}
						</button>
						{heroes.map((hero) => (
							<button
								key={hero.id}
								type="button"
								aria-pressed={selectedHero === hero.name}
								onClick={() => setSelectedHero(selectedHero === hero.name ? null : hero.name)}
								className={chipClasses(selectedHero === hero.name)}
							>
								{hero.name}
							</button>
						))}
					</div>
				)}
				<HideMaxToggle
					checked={hideMax}
					onChange={(checked) => updateSettings({ ui: { ...appSettings.ui, hideMax: checked } })}
				/>
			</div>
			{sections.length === 0 ? (
				<EmptyState title={text.empty.title} description={text.empty.allMax} />
			) : (
				sections.map(({ hero, all, listed }) => (
					<section key={hero.id} aria-labelledby={`hero-${hero.id}`} className="flex flex-col gap-3">
						<div className="flex flex-wrap items-baseline gap-x-3">
							<h2 id={`hero-${hero.id}`} className="text-lg font-semibold">
								{hero.name}
							</h2>
							<span className="text-muted">{text.section(all.length, all.filter(({ level }) => level > 0).length)}</span>
						</div>
						<Masonry>
							{listed.map(({ piece, level }) => (
								<EquipmentCard
									key={piece.id}
									piece={piece}
									heroName={hero.name}
									level={level}
									blacksmith={blacksmith}
									onUpgrade={() => actions.upgrade(hero.name, piece)}
									onSetLevel={(next) => actions.setLevel(hero.name, piece, next)}
								/>
							))}
						</Masonry>
					</section>
				))
			)}
		</>
	);
};

const Gate = ({ village }: { village: Playthrough }) =>
	blacksmithLevel(village) > 0 ? (
		<EquipmentContent village={village} />
	) : (
		<>
			<PageHeader title={text.title} subline={village.name} />
			<EmptyState
				title={text.locked.title}
				description={text.locked.description}
				actions={
					<ButtonLink href="/builder?tab=army" variant="primary">
						{text.locked.action}
					</ButtonLink>
				}
			/>
		</>
	);

export const EquipmentPage = () => (
	<Suspense fallback={null}>
		<VillageGate title={text.title}>{(village) => <Gate village={village} />}</VillageGate>
	</Suspense>
);
