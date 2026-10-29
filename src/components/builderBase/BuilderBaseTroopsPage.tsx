"use client";

import Image from "next/image";
import { Suspense } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useNow } from "@/lib/hooks/useNow";
import { builderBaseText, builderBaseTroopsText } from "@/lib/messages/builderBase";
import { upgradeText } from "@/lib/messages/upgrades";
import { bbTroopCatalog } from "@/service/builderBaseSteps";
import { bbResearchSlots, readLevel, requirementBlock } from "@/service/upgradeEngine";
import { upgradeSteps } from "@/service/upgradeSteps";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Masonry } from "@/comps/ui/Masonry";
import { HideMaxToggle } from "@/comps/upgrades/HideMaxToggle";
import { ItemCard } from "@/comps/upgrades/ItemCard";
import { LanesStrip } from "@/comps/upgrades/LanesStrip";
import { MassEditLink } from "@/comps/upgrades/MassEditLink";
import { useUpgradeFlow } from "@/comps/upgrades/useUpgradeFlow";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";

const text = builderBaseTroopsText;
const BUILDER_BASE_TOWN_HALL = 6;

const targetFor = (name: string): UpgradeTarget => ({ kind: "bbTroop", name });

const TroopsContent = ({ village }: { village: Playthrough }) => {
	const { appSettings, updateSettings } = usePlaythrough();
	const now = useNow();
	const state = bbResearchSlots(village);
	const { handlers, dialogs } = useUpgradeFlow(village, now, "bbResearch", state.slots);

	const hall = village.data.builderBase.builderHallLevel;
	const hideMax = appSettings.ui?.hideMax ?? false;
	const starLaboratory = village.data.builderBase.armyBuildings["star-laboratory"]?.[0]?.level ?? 0;
	const catalog = bbTroopCatalog(hall);
	const available = catalog.filter((troop) => troop.maxLevel > 0);
	const unavailable = catalog.filter((troop) => troop.maxLevel === 0);
	const isMaxed = (name: string) => readLevel(village, targetFor(name)) > 0 && upgradeSteps(village, targetFor(name)).length === 0;
	const shown = hideMax ? available.filter((troop) => !isMaxed(troop.name)) : available;

	const blockerFor = (name: string): string | undefined => {
		const step = upgradeSteps(village, targetFor(name))[0];
		const missing = step ? requirementBlock(village, step) : null;
		return missing ? upgradeText.start.requires[missing.building](missing.level) : undefined;
	};

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, hall)} />
			<MassEditLink scope="builder" tab="troops" />
			<LanesStrip
				title={text.strip.title}
				village={village}
				state={state}
				now={now}
				emptyNote={text.strip.noLanes}
				unassignedHelp={text.strip.unassignedHelp}
				gridClassName="sm:grid-cols-2"
				stats={[
					{
						label: text.strip.levelLabel,
						value: starLaboratory > 0 ? text.strip.level(starLaboratory, hall) : text.strip.notSet,
					},
				]}
				actions={
					<HideMaxToggle
						checked={hideMax}
						onChange={(checked) => updateSettings({ ui: { ...appSettings.ui, hideMax: checked } })}
					/>
				}
			/>
			{shown.length === 0 ? (
				<EmptyState title={text.empty.title} description={text.empty.allMax} />
			) : (
				<Masonry>
					{shown.map((troop) => (
						<ItemCard
							key={troop.id}
							village={village}
							target={targetFor(troop.name)}
							name={troop.name}
							maxLevel={troop.maxLevel}
							imageUrl={troop.imageUrl}
							maxLabel={text.card.maxAtHall(troop.maxLevel)}
							progressLabel={text.card.progress(troop.name)}
							detail={<span className="text-muted text-xs">{text.card.unlockedBy(troop.barracksRequired)}</span>}
							now={now}
							unlock={{ label: text.card.notUnlocked, action: text.card.markUnlocked, level: troop.firstLevel }}
							startBlocker={blockerFor(troop.name)}
							{...handlers}
							onLevelChange={(target, next) => {
								const current = readLevel(village, target);
								if (next > 0 && next < troop.firstLevel) {
									handlers.onLevelChange(target, next > current ? troop.firstLevel : 0);
									return;
								}
								handlers.onLevelChange(target, next);
							}}
						/>
					))}
				</Masonry>
			)}
			{unavailable.length > 0 && (
				<section aria-labelledby="bb-troops-unavailable" className="flex flex-col gap-3">
					<h2 id="bb-troops-unavailable" className="text-lg font-semibold">
						{text.unavailable.title}
					</h2>
					<Masonry>
						{unavailable.map((troop) => (
							<Card key={troop.id} dimmed role="group" aria-label={troop.name} className="flex items-center gap-3 p-4">
								{troop.imageUrl && (
									<Image src={troop.imageUrl} alt="" width={48} height={48} style={{ width: 48, height: 48 }} className="shrink-0 object-contain opacity-60" />
								)}
								<div className="flex min-w-0 flex-col gap-0.5">
									<h3 className="truncate text-base font-semibold">{troop.name}</h3>
									<span className="text-muted text-xs">
										{text.unavailable.requires(troop.barracksRequired, troop.builderHallRequired)}
									</span>
								</div>
							</Card>
						))}
					</Masonry>
				</section>
			)}
			{dialogs}
		</>
	);
};

const Gate = ({ village }: { village: Playthrough }) => {
	const townHall = village.data.homeVillage.townHallLevel;
	const hall = village.data.builderBase.builderHallLevel;
	if (townHall < BUILDER_BASE_TOWN_HALL && hall === 0) {
		return (
			<>
				<PageHeader title={text.title} subline={village.name} />
				<EmptyState title={builderBaseText.locked.title} description={builderBaseText.locked.description(townHall)} />
			</>
		);
	}
	if (hall === 0) {
		return (
			<>
				<PageHeader title={text.title} subline={text.sublineNotSet(village.name)} />
				<EmptyState
					title={builderBaseText.notSet.title}
					description={builderBaseText.notSet.troopsDescription}
					actions={
						<ButtonLink href="/builder-base/upgrades?tab=other" variant="primary">
							{builderBaseText.notSet.action}
						</ButtonLink>
					}
				/>
			</>
		);
	}
	return <TroopsContent village={village} />;
};

export const BuilderBaseTroopsPage = () => (
	<Suspense fallback={null}>
		<VillageGate title={text.title}>{(village) => <Gate village={village} />}</VillageGate>
	</Suspense>
);
