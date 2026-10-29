"use client";

import { Suspense } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useNow } from "@/lib/hooks/useNow";
import { useUrlTab } from "@/lib/hooks/useUrlTab";
import { builderBaseText } from "@/lib/messages/builderBase";
import {
	getBuilderArmyBuildingsAtBH,
	getBuilderDefensesAtBH,
	getBuilderResourceBuildingsAtBH,
	getBuilderTrapsAtBH,
} from "@/lib/utils/massEditBuilderHelpers";
import { bbBuilderSlots, runningBuilderBase } from "@/service/upgradeEngine";
import { BuildingsTab } from "@/comps/builder/BuildingsTab";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Tabs } from "@/comps/ui/Tabs";
import { HideMaxToggle } from "@/comps/upgrades/HideMaxToggle";
import { LanesStrip } from "@/comps/upgrades/LanesStrip";
import { MassEditLink } from "@/comps/upgrades/MassEditLink";
import { useUpgradeFlow } from "@/comps/upgrades/useUpgradeFlow";
import type { Playthrough } from "@/types/app";
import type { BuildingRecordKey } from "@/types/app/game";
import { BuilderBaseHeroesTab } from "./BuilderBaseHeroesTab";
import { BuilderBaseOtherTab } from "./BuilderBaseOtherTab";
import { BuilderHallTile } from "./BuilderHallTile";

const text = builderBaseText;
const TAB_IDS = ["defenses", "army", "resources", "traps", "heroes", "other"] as const;
const BUILDER_BASE_TOWN_HALL = 6;

const BUILDING_TABS = {
	defenses: { record: "defenses", list: getBuilderDefensesAtBH },
	army: { record: "armyBuildings", list: getBuilderArmyBuildingsAtBH },
	resources: { record: "resourceBuildings", list: getBuilderResourceBuildingsAtBH },
	traps: { record: "traps", list: getBuilderTrapsAtBH },
} as const satisfies Record<string, { record: BuildingRecordKey; list: (hall: number) => unknown }>;

const UpgradesContent = ({ village }: { village: Playthrough }) => {
	const { appSettings, updateSettings } = usePlaythrough();
	const now = useNow();
	const [tab, setTab] = useUrlTab(TAB_IDS, "defenses");
	const state = bbBuilderSlots(village);
	const { handlers, dialogs } = useUpgradeFlow(village, now, "bbBuilder", state.slots);

	const hall = village.data.builderBase.builderHallLevel;
	const hideMax = appSettings.ui?.hideMax ?? false;
	const running = runningBuilderBase(village);
	const tabProps = { village, hideMax, now, ...handlers };

	const countFor = (id: (typeof TAB_IDS)[number]) => {
		if (id === "heroes") return running.filter(({ target }) => target.kind === "bbHero").length;
		if (id === "other") return running.filter(({ target }) => target.kind === "clockTower").length;
		return running.filter(({ target }) => target.kind === "bbBuilding" && target.record === BUILDING_TABS[id].record).length;
	};

	const renderTab = () => {
		if (tab === "heroes") return <BuilderBaseHeroesTab {...tabProps} />;
		if (tab === "other") return <BuilderBaseOtherTab {...tabProps} />;
		const config = BUILDING_TABS[tab];
		return <BuildingsTab {...tabProps} base="builderBase" record={config.record} buildings={config.list(hall)} />;
	};

	return (
		<>
			<PageHeader
				title={text.upgrades.title}
				subline={hall > 0 ? text.upgrades.subline(village.name, hall) : text.upgrades.sublineNotSet(village.name)}
			/>
			<MassEditLink scope="builder" />
			{hall === 0 ? (
				<>
					<EmptyState title={text.notSet.title} description={text.notSet.description} />
					<BuilderHallTile village={village} now={now} handlers={handlers} />
				</>
			) : (
				<>
					<LanesStrip
						title={text.upgrades.strip.title}
						village={village}
						state={state}
						now={now}
						emptyNote={text.upgrades.strip.noBuilders}
						unassignedHelp={text.upgrades.strip.unassignedHelp}
						gridClassName="sm:grid-cols-2"
						actions={
							<HideMaxToggle
								checked={hideMax}
								onChange={(checked) => updateSettings({ ui: { ...appSettings.ui, hideMax: checked } })}
							/>
						}
					/>
					<Tabs
						label={text.upgrades.tabsLabel}
						tabs={TAB_IDS.map((id) => ({ id, label: text.upgrades.tabs[id], count: countFor(id) || undefined }))}
						activeId={tab}
						onChange={setTab}
					>
						{renderTab()}
					</Tabs>
				</>
			)}
			{dialogs}
		</>
	);
};

const Gate = ({ village }: { village: Playthrough }) => {
	const townHall = village.data.homeVillage.townHallLevel;
	const unlocked = townHall >= BUILDER_BASE_TOWN_HALL || village.data.builderBase.builderHallLevel > 0;
	if (unlocked) return <UpgradesContent village={village} />;
	return (
		<>
			<PageHeader title={text.upgrades.title} subline={village.name} />
			<EmptyState title={text.locked.title} description={text.locked.description(townHall)} />
		</>
	);
};

export const BuilderBaseUpgradesPage = () => (
	<Suspense fallback={null}>
		<VillageGate title={text.upgrades.title}>{(village) => <Gate village={village} />}</VillageGate>
	</Suspense>
);
