"use client";

import { Suspense, useState } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { formatDuration, formatNumber } from "@/lib/format";
import { useNow } from "@/lib/hooks/useNow";
import { useQueueActions } from "@/lib/hooks/useQueueActions";
import { useUpgradeActions } from "@/lib/hooks/useUpgradeActions";
import { queueText } from "@/lib/messages/queue";
import { settingsText } from "@/lib/messages/settings";
import { scheduleQueue } from "@/service/upgradeQueue";
import { boostForLane } from "@/service/goldPass";
import { ActiveHoursForm } from "@/comps/settings/ActiveHoursCard";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { Badge } from "@/comps/ui/Badge";
import { Button, ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Dialog } from "@/comps/ui/Dialog";
import { EmptyState } from "@/comps/ui/EmptyState";
import { SwitchRow } from "@/comps/ui/Switch";
import type { Playthrough } from "@/types/app";
import type { LaneKind } from "@/types/app/engine";
import { AddUpgradeFlyout } from "./AddUpgradeFlyout";
import { LaneCard } from "./LaneCard";
import { QueueTimeline } from "./QueueTimeline";
import { queueLanes } from "./queueLanes";

const text = queueText;
const DEFAULT_ZOOM_DAYS = 14;
const PETS_TOWN_HALL = 14;

const Total = ({ label, value, detail }: { label: string; value: string; detail?: string }) => (
	<div className="flex flex-col">
		<span className="text-muted text-xs">{label}</span>
		<span className="font-mono text-lg font-medium">{value}</span>
		{detail && <span className="text-muted text-xs">{detail}</span>}
	</div>
);

const QueueContent = ({ village, lane }: { village: Playthrough; lane: LaneKind }) => {
	const { appSettings, updateSettings } = usePlaythrough();
	const actions = useQueueActions(village, lane);
	const upgradeActions = useUpgradeActions(village);
	const laneText = text.lanes[lane];
	const config = queueLanes[lane];
	const petsLocked = lane === "pet" && village.data.homeVillage.townHallLevel < PETS_TOWN_HALL;
	const isBuilderBase = lane === "bbBuilder" || lane === "bbResearch";
	const now = useNow();
	const [optionsOpen, setOptionsOpen] = useState(false);
	const [adding, setAdding] = useState<{ laneId: number | null } | null>(null);

	const boostPercent = boostForLane(lane, village, new Date(now));
	const goblinEnabled = config.goblinSetting ? appSettings[config.goblinSetting] : false;
	const schedule = scheduleQueue(village, lane, goblinEnabled, {
		now: new Date(now),
		boostPercent,
		activeHours: appSettings.activeHours,
	});
	const { totals } = schedule;
	const zoomDays = Number(appSettings.ui?.queueWindows?.[config.windowKey] ?? DEFAULT_ZOOM_DAYS);
	const hiddenCategories = (config.hiddenKey && appSettings.ui?.hiddenCategories?.[config.hiddenKey]) || [];

	const costText = Object.entries(totals.costByResource)
		.map(([resource, amount]) => `${formatNumber(amount)} ${resource}`)
		.join(", ");
	const finishFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

	return (
		<>
			<PageHeader
				title={laneText.title}
				subline={laneText.subline(village.name, village.data.builderBase.builderHallLevel)}
				actions={
					<>
						<Button onClick={() => setOptionsOpen(true)}>{text.options.open}</Button>
						<ButtonLink href={config.backHref}>{laneText.back}</ButtonLink>
					</>
				}
			/>
			<Card className="flex flex-col gap-4 p-4">
				{!isBuilderBase && (
					<div className="flex flex-wrap items-center gap-3">
						<Badge tone={boostPercent > 0 ? "kept" : "locked"}>{text.goldPass(boostPercent)}</Badge>
					</div>
				)}
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
					<Total label={laneText.free} value={text.totals.freeValue(totals.freeBuilders, totals.totalBuilders)} />
					<Total label={text.totals.queued} value={String(totals.queuedCount)} />
					<Total label={text.totals.time} value={totals.queuedCount === 0 ? text.totals.none : formatDuration(totals.queuedMs)} />
					<Total
						label={text.totals.allDone}
						value={totals.allDoneAt ? finishFormatter.format(totals.allDoneAt) : text.totals.none}
					/>
					<Total label={text.totals.cost} value={costText || text.totals.noCost} />
				</div>
			</Card>
			{schedule.lanes.length === 0 || petsLocked ? (
				<EmptyState title={laneText.title} description={laneText.gate} actions={<ButtonLink href={config.backHref} variant="primary">{laneText.back}</ButtonLink>} />
			) : (
				<>
					<QueueTimeline
						schedule={schedule}
						now={now}
						zoomDays={zoomDays}
						onZoomChange={(days) =>
							updateSettings({
								ui: { ...appSettings.ui, queueWindows: { ...appSettings.ui?.queueWindows, [config.windowKey]: String(days) } },
							})
						}
					/>
					<div className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
						{schedule.lanes.map((slot) => (
							<LaneCard
								key={slot.slot.id}
								lane={lane}
								village={village}
								schedule={slot}
								lanes={schedule.lanes}
								conflicts={schedule.conflicts}
								now={now}
								onAdd={(laneId) => setAdding({ laneId })}
								onRemove={actions.remove}
								onMove={actions.move}
								onStartNow={actions.startNow}
							/>
						))}
					</div>
				</>
			)}
			<Dialog
				open={optionsOpen}
				onClose={() => setOptionsOpen(false)}
				title={text.options.title}
				description={text.options.description}
				footer={<Button variant="primary" onClick={() => setOptionsOpen(false)}>{text.options.done}</Button>}
			>
				<div className="flex flex-col gap-5">
					{config.goblinSetting && "goblin" in laneText && (
						<SwitchRow
							label={laneText.goblin.label}
							description={laneText.goblin.help}
							checked={goblinEnabled}
							onChange={(enabled) => config.goblinSetting && updateSettings({ [config.goblinSetting]: enabled })}
						/>
					)}
					<div className="flex flex-col gap-3">
						<h3 className="text-base font-semibold">{settingsText.activeHours.title}</h3>
						<p className="text-muted">{settingsText.activeHours.description}</p>
						<ActiveHoursForm />
					</div>
				</div>
			</Dialog>
			<AddUpgradeFlyout
				open={adding !== null && schedule.lanes.length > 0 && !petsLocked}
				lane={lane}
				village={village}
				lanes={schedule.lanes}
				initialLaneId={adding?.laneId ?? null}
				boostPercent={boostPercent}
				hiddenCategories={hiddenCategories}
				onHiddenCategoriesChange={(categories) => {
					if (!config.hiddenKey) return;
					updateSettings({
						ui: {
							...appSettings.ui,
							hiddenCategories: { ...appSettings.ui?.hiddenCategories, [config.hiddenKey]: categories },
						},
					});
				}}
				onAdd={actions.add}
				onUnlock={(group) => upgradeActions.changeLevel(group.target, group.unlockLevel ?? 1)}
				onClose={() => setAdding(null)}
			/>
		</>
	);
};

export const QueuePage = ({ lane }: { lane: LaneKind }) => (
	<Suspense fallback={null}>
		<VillageGate title={text.lanes[lane].title}>{(village) => <QueueContent village={village} lane={lane} />}</VillageGate>
	</Suspense>
);
