"use client";

import { Suspense, useState } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useNow } from "@/lib/hooks/useNow";
import { useUpgradeActions } from "@/lib/hooks/useUpgradeActions";
import { useUrlTab } from "@/lib/hooks/useUrlTab";
import { builderText } from "@/lib/messages/builder";
import {
	getArmyBuildingsAtTH,
	getDefensesAtTH,
	getGuardiansAtTH,
	getResourceBuildingsAtTH,
	getTrapsAtTH,
} from "@/lib/utils/massEditHelpers";
import { goldPassBoosts } from "@/service/goldPass";
import { runningUpgrades } from "@/service/upgradeEngine";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { SwitchRow } from "@/comps/ui/Switch";
import { Tabs } from "@/comps/ui/Tabs";
import { CancelUpgradeDialog } from "@/comps/upgrades/CancelUpgradeDialog";
import { FinishUpgradeDialog } from "@/comps/upgrades/FinishUpgradeDialog";
import { StartUpgradeDialog } from "@/comps/upgrades/StartUpgradeDialog";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { BuildingRecordKey } from "@/types/app/game";
import type { RunningSubject, StartUpgradeSubject } from "@/types/components/upgrades";
import { BuildersStrip } from "./BuildersStrip";
import { BuildingsTab } from "./BuildingsTab";
import { CraftedTab } from "./CraftedTab";
import { HeroesTab } from "./HeroesTab";
import { LockedTab } from "./LockedTab";
import { TownHallTab } from "./TownHallTab";

const text = builderText;
const TAB_IDS = ["defenses", "army", "resources", "crafted", "traps", "heroes", "guardians", "townHall"] as const;
type TabId = (typeof TAB_IDS)[number];
const LOCKED_TOWN_HALL = 18;
const LOCKED_TABS: TabId[] = ["crafted", "guardians"];

const BUILDING_TABS: Partial<Record<TabId, { record: BuildingRecordKey; list: (townHall: number) => ReturnType<typeof getDefensesAtTH> }>> = {
	defenses: { record: "defenses", list: getDefensesAtTH },
	army: { record: "armyBuildings", list: getArmyBuildingsAtTH },
	resources: { record: "resourceBuildings", list: getResourceBuildingsAtTH },
	traps: { record: "traps", list: getTrapsAtTH },
	guardians: { record: "defenses", list: getGuardiansAtTH },
};

const TAB_RECORD: Partial<Record<TabId, BuildingRecordKey>> = {
	defenses: "defenses",
	army: "armyBuildings",
	resources: "resourceBuildings",
	traps: "traps",
};

const tabCount = (village: Playthrough, tab: TabId): number => {
	const running = runningUpgrades(village);
	switch (tab) {
		case "heroes":
			return running.filter(({ target }) => target.kind === "hero").length;
		case "crafted":
			return running.filter(({ target }) => target.kind === "crafted").length;
		case "townHall":
			return running.filter(({ target }) => target.kind === "townHall" || target.kind === "townHallWeapon").length;
		case "guardians":
			return 0;
		default:
			return running.filter(({ target }) => target.kind === "building" && target.record === TAB_RECORD[tab]).length;
	}
};

const BuilderContent = ({ village }: { village: Playthrough }) => {
	const { appSettings, updateSettings } = usePlaythrough();
	const actions = useUpgradeActions(village);
	const now = useNow();
	const [tab, setTab] = useUrlTab(TAB_IDS, "defenses");
	const [starting, setStarting] = useState<{ subject: StartUpgradeSubject; target: UpgradeTarget } | null>(null);
	const [finishing, setFinishing] = useState<RunningSubject | null>(null);
	const [cancelling, setCancelling] = useState<RunningSubject | null>(null);

	const townHall = village.data.homeVillage.townHallLevel;
	const hideMax = appSettings.ui?.hideMax ?? false;
	const handlers = {
		onStart: (subject: StartUpgradeSubject, target: UpgradeTarget) => setStarting({ subject, target }),
		onFinish: setFinishing,
		onCancel: setCancelling,
		onLevelChange: actions.changeLevel,
	};
	const tabProps = { village, hideMax, now, ...handlers };

	const renderTab = () => {
		if (LOCKED_TABS.includes(tab) && townHall < LOCKED_TOWN_HALL) {
			return <LockedTab townHall={townHall} required={LOCKED_TOWN_HALL} onGoToTownHall={() => setTab("townHall")} />;
		}
		const buildingTab = BUILDING_TABS[tab];
		if (buildingTab) {
			return (
				<BuildingsTab
					{...tabProps}
					record={buildingTab.record}
					buildings={buildingTab.list(townHall)}
				/>
			);
		}
		if (tab === "heroes") return <HeroesTab {...tabProps} />;
		if (tab === "crafted") return <CraftedTab {...tabProps} />;
		return <TownHallTab {...tabProps} />;
	};

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, townHall)} />
			<BuildersStrip village={village} goblin={actions.goblinBuilderEnabled} now={now} />
			<Tabs
				label={text.tabsLabel}
				tabs={TAB_IDS.map((id) => ({
					id,
					label: text.tabs[id],
					count: tabCount(village, id) || undefined,
					locked: LOCKED_TABS.includes(id) && townHall < LOCKED_TOWN_HALL,
				}))}
				activeId={tab}
				onChange={setTab}
			>
				<div className="flex flex-col gap-4">
					{tab !== "townHall" && (
						<div className="max-w-sm">
							<SwitchRow
								label={text.hideMax}
								description={text.hideMaxHelp}
								checked={hideMax}
								onChange={(checked) =>
									updateSettings({ ui: { ...appSettings.ui, hideMax: checked } })
								}
							/>
						</div>
					)}
					{renderTab()}
				</div>
			</Tabs>
			<StartUpgradeDialog
				subject={starting?.subject ?? null}
				village={village}
				boostPercent={goldPassBoosts(village, new Date(now)).builder}
				now={now}
				goblinBuilderEnabled={actions.goblinBuilderEnabled}
				onConfirm={(builderId) => starting && actions.start(starting.target, starting.subject.step, builderId)}
				onClose={() => setStarting(null)}
			/>
			<FinishUpgradeDialog
				subject={finishing}
				now={now}
				onConfirm={(method) => finishing && actions.finish(finishing.target, method)}
				onClose={() => setFinishing(null)}
			/>
			<CancelUpgradeDialog
				subject={cancelling}
				now={now}
				onConfirm={() => cancelling && actions.cancel(cancelling.target, cancelling.fromLevel)}
				onClose={() => setCancelling(null)}
			/>
		</>
	);
};

export const BuilderPage = () => (
	<Suspense fallback={null}>
		<VillageGate title={text.title}>{(village) => <BuilderContent village={village} />}</VillageGate>
	</Suspense>
);
