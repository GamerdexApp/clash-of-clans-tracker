"use client";

import { Suspense } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useNow } from "@/lib/hooks/useNow";
import { useUrlTab } from "@/lib/hooks/useUrlTab";
import { researchText } from "@/lib/messages/research";
import { upgradeText } from "@/lib/messages/upgrades";
import { getArmyBuildingsAtTH, getSiegeMachinesAtTH, getSpellsAtTH, getTroopsAtTH } from "@/lib/utils/massEditHelpers";
import { goldPassBoosts } from "@/service/goldPass";
import { readLevel, requirementBlock, researchSlots, runningResearch } from "@/service/upgradeEngine";
import { upgradeSteps } from "@/service/upgradeSteps";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Tabs } from "@/comps/ui/Tabs";
import { HideMaxToggle } from "@/comps/upgrades/HideMaxToggle";
import { MassEditLink } from "@/comps/upgrades/MassEditLink";
import { ItemCard } from "@/comps/upgrades/ItemCard";
import { LanesStrip } from "@/comps/upgrades/LanesStrip";
import { useUpgradeFlow } from "@/comps/upgrades/useUpgradeFlow";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { ResearchKey } from "@/types/app/game";
import type { UpgradeHandlers } from "@/types/components/builder";

const text = researchText;
const TAB_IDS = ["troops", "spells", "siegeMachines"] as const;
type TabId = (typeof TAB_IDS)[number];

const ITEMS_AT_TH: Record<TabId, (townHall: number) => ReturnType<typeof getTroopsAtTH>> = {
	troops: getTroopsAtTH,
	spells: getSpellsAtTH,
	siegeMachines: getSiegeMachinesAtTH,
};

const targetFor = (record: ResearchKey, name: string): UpgradeTarget => ({ kind: "research", record, name });

/** Dark Elixir research sits after the Elixir research, as in the game's Laboratory. */
const byCostResource = (a: { costResource?: string }, b: { costResource?: string }) =>
	Number(a.costResource === "Dark Elixir") - Number(b.costResource === "Dark Elixir");

const Items = ({
	village,
	tab,
	hideMax,
	now,
	handlers,
}: {
	village: Playthrough;
	tab: TabId;
	hideMax: boolean;
	now: number;
	handlers: UpgradeHandlers;
}) => {
	const items = [...ITEMS_AT_TH[tab](village.data.homeVillage.townHallLevel)].sort(byCostResource);
	if (items.length === 0) return <EmptyState title={text.empty.title} description={text.empty.none} />;

	const isMaxed = (name: string) => {
		const target = targetFor(tab, name);
		return readLevel(village, target) > 0 && upgradeSteps(village, target).length === 0;
	};
	const shown = hideMax ? items.filter((item) => !isMaxed(item.name)) : items;
	if (shown.length === 0) return <EmptyState title={text.empty.title} description={text.empty.allMax} />;

	return (
		<div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
			{shown.map((item) => {
				const target = targetFor(tab, item.name);
				const step = upgradeSteps(village, target)[0];
				const missing = step ? requirementBlock(village, step) : null;
				return (
					<ItemCard
						key={item.name}
						village={village}
						target={target}
						name={item.name}
						maxLevel={item.maxLevel}
						imageUrl={item.imageUrl}
						maxLabel={text.card.maxAtHall(item.maxLevel)}
						progressLabel={text.card.progress(item.name)}
						now={now}
						unlock={{ label: text.card.notUnlocked, action: text.card.markUnlocked }}
						startBlocker={missing ? upgradeText.start.requires[missing.building](missing.level) : undefined}
						{...handlers}
					/>
				);
			})}
		</div>
	);
};

const ResearchContent = ({ village }: { village: Playthrough }) => {
	const { appSettings, updateSettings } = usePlaythrough();
	const now = useNow();
	const [tab, setTab] = useUrlTab(TAB_IDS, "troops");
	const state = researchSlots(village, appSettings.goblinResearchEnabled);
	const { handlers, dialogs } = useUpgradeFlow(village, now, "research", state.slots);

	const townHall = village.data.homeVillage.townHallLevel;
	const hideMax = appSettings.ui?.hideMax ?? false;
	const boost = goldPassBoosts(village, new Date(now)).research;
	const laboratory = village.data.homeVillage.armyBuildings.laboratory?.[0]?.level ?? 0;
	const laboratoryMax = getArmyBuildingsAtTH(townHall).find((building) => building.id === "laboratory")?.maxLevel ?? 0;
	const running = runningResearch(village);

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, townHall)} />
			<MassEditLink tab={tab} />
			<LanesStrip
				title={text.strip.title}
				village={village}
				state={state}
				now={now}
				queueHref="/research/queue"
				queueLabel={text.strip.openQueue}
				emptyNote={text.strip.noLanes}
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
						value: laboratory > 0 ? text.strip.level(laboratory, laboratoryMax) : text.strip.notTracked,
					},
					{ label: text.strip.boostLabel, value: text.boostValue(boost) },
				]}
			/>
			<Tabs
				label={text.tabsLabel}
				tabs={TAB_IDS.map((id) => ({
					id,
					label: text.tabs[id],
					count: running.filter(({ target }) => target.kind === "research" && target.record === id).length || undefined,
				}))}
				activeId={tab}
				onChange={setTab}
			>
				<Items village={village} tab={tab} hideMax={hideMax} now={now} handlers={handlers} />
			</Tabs>
			{dialogs}
		</>
	);
};

export const ResearchPage = () => (
	<Suspense fallback={null}>
		<VillageGate title={text.title}>{(village) => <ResearchContent village={village} />}</VillageGate>
	</Suspense>
);
