"use client";

import Image from "next/image";
import { Suspense } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useNow } from "@/lib/hooks/useNow";
import { petsText } from "@/lib/messages/pets";
import { upgradeText } from "@/lib/messages/upgrades";
import { getArmyBuildingsAtTH, getPetsAtTH } from "@/lib/utils/massEditHelpers";
import { goldPassBoosts } from "@/service/goldPass";
import { allPets } from "@/service/petCatalog";
import { petSlots, readLevel, requirementBlock } from "@/service/upgradeEngine";
import { upgradeSteps } from "@/service/upgradeSteps";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Masonry } from "@/comps/ui/Masonry";
import { Note } from "@/comps/ui/Note";
import { HideMaxToggle } from "@/comps/upgrades/HideMaxToggle";
import { ItemCard } from "@/comps/upgrades/ItemCard";
import { LanesStrip } from "@/comps/upgrades/LanesStrip";
import { useUpgradeFlow } from "@/comps/upgrades/useUpgradeFlow";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";

const text = petsText;
const PETS_TOWN_HALL = 14;

const targetFor = (name: string): UpgradeTarget => ({ kind: "pet", name });

const LockedPets = ({ townHall }: { townHall: number }) => (
	<>
		<Note>{text.locked.body(townHall)}</Note>
		<Masonry>
			{allPets().map((pet) => (
				<Card key={pet.name} dimmed role="group" aria-label={pet.name} className="flex items-center gap-3 p-4">
					{pet.imageUrl && (
						<Image
							src={pet.imageUrl}
							alt=""
							width={48}
							height={48}
							style={{ width: 48, height: 48 }}
							className="shrink-0 object-contain opacity-60"
						/>
					)}
					<div className="flex min-w-0 flex-col gap-0.5">
						<h3 className="truncate text-base font-semibold">{pet.name}</h3>
						<span className="text-muted text-xs">{text.locked.needs(pet.townHallRequired, pet.petHouseRequired)}</span>
					</div>
				</Card>
			))}
		</Masonry>
	</>
);

const PetsContent = ({ village }: { village: Playthrough }) => {
	const { appSettings, updateSettings } = usePlaythrough();
	const now = useNow();
	const state = petSlots(village);
	const { handlers, dialogs } = useUpgradeFlow(village, now, "pet", state.slots);

	const townHall = village.data.homeVillage.townHallLevel;
	const hideMax = appSettings.ui?.hideMax ?? false;
	const boost = goldPassBoosts(village, new Date(now)).research;
	const petHouse = village.data.homeVillage.armyBuildings["pet-house"]?.[0]?.level ?? 0;
	const petHouseMax = getArmyBuildingsAtTH(townHall).find((building) => building.id === "pet-house")?.maxLevel ?? 0;

	const isMaxed = (name: string) =>
		readLevel(village, targetFor(name)) > 0 && upgradeSteps(village, targetFor(name)).length === 0;
	const pets = getPetsAtTH(townHall);
	const shown = hideMax ? pets.filter((pet) => !isMaxed(pet.name)) : pets;

	const blockerFor = (name: string): string | undefined => {
		if (petHouse === 0) return upgradeText.start.requires.noPetHouse;
		const step = upgradeSteps(village, targetFor(name))[0];
		const missing = step ? requirementBlock(village, step) : null;
		return missing ? upgradeText.start.requires[missing.building](missing.level) : undefined;
	};

	if (townHall < PETS_TOWN_HALL) {
		return (
			<>
				<PageHeader title={text.title} subline={text.locked.title} />
				<LockedPets townHall={townHall} />
			</>
		);
	}

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, townHall)} />
			<LanesStrip
				title={text.strip.title}
				village={village}
				state={state}
				now={now}
				queueHref="/pets/queue"
				queueLabel={text.strip.openQueue}
				emptyNote={text.strip.noPetHouse}
				unassignedHelp={text.strip.unassignedHelp}
				gridClassName="sm:grid-cols-2"
				actions={
					<HideMaxToggle
						checked={hideMax}
						onChange={(checked) => updateSettings({ ui: { ...appSettings.ui, hideMax: checked } })}
					/>
				}
				stats={[
					{
						label: text.strip.levelLabel,
						value: petHouse > 0 ? text.strip.level(petHouse, petHouseMax) : text.strip.notBuilt,
					},
					{ label: text.strip.boostLabel, value: text.boostValue(boost) },
				]}
			/>
			<div className="flex flex-col gap-4">
				{shown.length === 0 ? (
					<EmptyState title={text.empty.title} description={text.empty.allMax} />
				) : (
					<Masonry>
						{shown.map((pet) => (
							<ItemCard
								key={pet.name}
								village={village}
								target={targetFor(pet.name)}
								name={pet.name}
								maxLevel={pet.maxLevel}
								imageUrl={pet.imageUrl}
								maxLabel={text.card.maxAtHall(pet.maxLevel)}
								progressLabel={text.card.progress(pet.name)}
								now={now}
								unlock={{ label: text.card.notUnlocked, action: text.card.markUnlocked }}
								startBlocker={blockerFor(pet.name)}
								{...handlers}
							/>
						))}
					</Masonry>
				)}
			</div>
			{dialogs}
		</>
	);
};

export const PetsPage = () => (
	<Suspense fallback={null}>
		<VillageGate title={text.title}>{(village) => <PetsContent village={village} />}</VillageGate>
	</Suspense>
);
