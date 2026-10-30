"use client";

import { formatMonthDay } from "@/lib/format";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { LuCheck, LuLock } from "react-icons/lu";
import type { Playthrough } from "@/types/app";
import { formatDuration, formatNumber } from "@/lib/format";
import { useDailiesActions } from "@/lib/hooks/useDailiesActions";
import { dailiesText } from "@/lib/messages/dailies";
import { overviewText } from "@/lib/messages/overview";
import { dailiesOf } from "@/service/dailies";
import {
	autoCycleEnd,
	autoForgeOpen,
	dailyCapitalGold,
	forgeResource,
	forgeSlots,
	formatResourceAmount,
	openSlotCount,
	slotState,
} from "@/service/forge";
import { goldPassBoosts, monthResetDate, seasonPassOpen } from "@/service/goldPass";
import { type HelperId, helperOpen, helperTownHall, previewHelperUse } from "@/service/helpers";
import { clanCapitalState, lockedRequirement } from "@/service/navAccess";
import { DailyTimer } from "@/comps/dailies/DailyTimer";
import { StopAutoForgeDialog } from "@/comps/dailies/StopAutoForgeDialog";
import { Badge } from "@/comps/ui/Badge";
import { Button, ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";

const text = overviewText.dailies;
const STAR_BONUS_TOWN_HALL = 3;
const CAPITAL_GOLD_TOWN_HALL = 6;

interface CellProps {
	title: string;
	/** The requirement text of a cell that does not apply yet. */
	requirement?: string;
	badge?: ReactNode;
	children?: ReactNode;
}

const Cell = ({ title, requirement, badge, children }: CellProps) => (
	<Card
		dimmed={requirement !== undefined}
		role="group"
		aria-label={title}
		className="flex flex-col gap-2 p-3"
	>
		<div className="flex items-center justify-between gap-2">
			<h4 className="font-semibold">{title}</h4>
			{badge}
		</div>
		{requirement ? (
			<span className="text-muted text-sm">{text.requires(requirement)}</span>
		) : (
			children
		)}
	</Card>
);

const GroupTitle = ({ children }: { children: ReactNode }) => (
	<h3 className="text-muted font-mono text-xs tracking-[0.08em] uppercase">{children}</h3>
);

const hasHelperHut = (village: Playthrough) => lockedRequirement("helpers", village) === null;

const HelperCell = ({
	village,
	helper,
	now,
}: {
	village: Playthrough;
	helper: HelperId;
	now: Date;
}) => {
	const actions = useDailiesActions(village);
	const name = dailiesText.helpers.names[helper];
	const helpers = dailiesOf(village).helpers;

	if (!hasHelperHut(village)) return <Cell title={name} requirement={text.helperHut} />;
	if (!helperOpen(helper, village))
		return <Cell title={name} requirement={text.townHall(helperTownHall[helper])} />;
	if (helper === "prospector" && !helpers.prospectorUnlocked) {
		return (
			<Cell title={name}>
				<Link href="/season-pass" className="text-link text-sm font-medium underline">
					{text.unlockProspector}
				</Link>
			</Cell>
		);
	}

	const isAssistant = helper === "buildersApprentice" || helper === "labAssistant";
	const preview = isAssistant ? previewHelperUse(village, helper, now) : null;
	return (
		<Cell title={name}>
			<DailyTimer
				timer={helpers[helper]}
				now={now}
				name={name}
				onSetTime={(time) => actions.setResetTime(helper, time)}
				onSetTimeAndUse={(time) => actions.setResetTimeAndUse(helper, time, name)}
				onUse={() => actions.markHelperUsed(helper)}
			/>
			{preview && (
				<span className="text-sm">
					{text.helperPreview(
						formatDuration(preview.remainingMs),
						formatDuration(preview.afterMs)
					)}
				</span>
			)}
		</Cell>
	);
};

const AutoForgeCell = ({ village, now }: { village: Playthrough; now: Date }) => {
	const actions = useDailiesActions(village);
	const [confirming, setConfirming] = useState(false);
	const auto = dailiesOf(village).autoForge;
	if (!autoForgeOpen(village)) {
		const perk = dailiesOf(village).goldPass.autoForgeUnlocked;
		return (
			<Cell title={text.autoForge} requirement={perk ? text.townHall(7) : text.autoPerk} />
		);
	}

	const running = autoCycleEnd(auto, now) !== null;
	return (
		<Cell
			title={text.autoForge}
			badge={
				<Badge tone={running ? "added" : "locked"}>
					{running ? text.running : text.notRunning}
				</Badge>
			}
		>
			{running && (
				<span className="text-sm">
					{text.autoLine(
						formatResourceAmount(auto.resourceAmount),
						forgeResource(auto.resourceType).label,
						formatNumber(auto.capitalGoldOutput)
					)}
				</span>
			)}
			<div className="flex flex-wrap gap-2">
				{running && (
					<Button variant="danger" onClick={() => setConfirming(true)}>
						{text.stopAuto}
					</Button>
				)}
				<ButtonLink href="/forge">{text.openForge}</ButtonLink>
			</div>
			<StopAutoForgeDialog
				open={confirming}
				auto={auto}
				now={now}
				onClose={() => setConfirming(false)}
				onStop={actions.stopAuto}
			/>
		</Cell>
	);
};

const SlotsCell = ({ village, now }: { village: Playthrough; now: Date }) => {
	const open = openSlotCount(village.data.homeVillage.townHallLevel);
	if (open === 0) return null;
	const states = forgeSlots(village)
		.slice(0, open)
		.map((slot) => slotState(slot, now));
	const running = states.filter((state) => state === "running").length;
	const done = states.filter((state) => state === "done").length;
	return (
		<Cell title={text.forgeSlots}>
			<span className="text-sm">{text.slotsLine(running, open)}</span>
			{done > 0 && <span className="text-sm">{text.slotsDone(done)}</span>}
			<div>
				<ButtonLink href="/forge">{text.openForge}</ButtonLink>
			</div>
		</Cell>
	);
};

const GoldPassCell = ({ village, now }: { village: Playthrough; now: Date }) => {
	const goldPass = dailiesOf(village).goldPass;
	const boosts = goldPassBoosts(village, now);
	const reset = formatMonthDay(monthResetDate(now), "short");
	const copy = text.goldPass;
	const rows: Array<[string, ReactNode]> = [
		[copy.builder, boosts.builder === 0 ? copy.off : `${boosts.builder}%`],
		[copy.research, boosts.research === 0 ? copy.off : `${boosts.research}%`],
	];
	const perks: Array<[string, boolean]> = [
		[copy.hoggyBank, goldPass.hoggyBankUnlocked],
		[copy.gemDonations, goldPass.gemDonationsUnlocked],
		[copy.autoForge, goldPass.autoForgeUnlocked],
		[copy.requestReduction, goldPass.requestTimeReductionUnlocked],
	];
	return (
		<Card className="flex flex-col gap-3 p-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h4 className="font-semibold">{text.groups.goldPass}</h4>
				<Link href="/season-pass" className="text-link text-sm font-medium underline">
					{copy.edit}
				</Link>
			</div>
			<dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-3 xl:grid-cols-6">
				{rows.map(([label, value]) => (
					<div key={label} className="flex justify-between gap-2">
						<dt className="text-muted">{label}</dt>
						<dd className="font-mono">{value}</dd>
					</div>
				))}
				{perks.map(([label, on]) => (
					<div key={label} className="flex items-center justify-between gap-2">
						<dt className="text-muted">{label}</dt>
						<dd>
							{on ? (
								<LuCheck aria-label={copy.on} size={16} className="text-kept" />
							) : (
								<LuLock aria-label={copy.off} size={16} className="text-muted" />
							)}
						</dd>
					</div>
				))}
			</dl>
			<p className="text-muted text-xs">
				{copy.resets(reset)} {copy.readOnly}
			</p>
		</Card>
	);
};

/** The Dailies section: helpers, the daily timers and the Gold Pass. Only the timers write. */
export const DailiesPanel = ({ village, now }: { village: Playthrough; now: Date }) => {
	const actions = useDailiesActions(village);
	const townHall = village.data.homeVillage.townHallLevel;
	const dailies = dailiesOf(village);

	if (townHall < STAR_BONUS_TOWN_HALL) {
		return (
			<EmptyState
				title={text.closedTitle}
				description={text.closedBody}
				actions={<ButtonLink href="/forge">{text.closedLink}</ButtonLink>}
			/>
		);
	}

	const capitalGoldShown = clanCapitalState(village) !== "off";
	const capitalGold = dailyCapitalGold(townHall);

	return (
		<section aria-labelledby="overview-dailies" className="flex flex-col gap-3">
			<h2 id="overview-dailies" className="text-lg font-semibold">
				{text.title}
			</h2>
			<GroupTitle>{text.groups.helpers}</GroupTitle>
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{(["buildersApprentice", "labAssistant", "alchemist", "prospector"] as const).map(
					(helper) => (
						<HelperCell key={helper} village={village} helper={helper} now={now} />
					)
				)}
			</div>
			<GroupTitle>{text.groups.daily}</GroupTitle>
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<Cell title={text.starBonus}>
					<DailyTimer
						timer={dailies.starBonus}
						now={now}
						name={text.starBonus}
						onSetTime={(time) => actions.setResetTime("starBonus", time)}
						onSetTimeAndUse={(time) =>
							actions.setResetTimeAndUse("starBonus", time, text.starBonus)
						}
						onUse={() => actions.markTimerUsed("starBonus", text.starBonus)}
					/>
				</Cell>
				{capitalGoldShown &&
					(townHall >= CAPITAL_GOLD_TOWN_HALL ? (
						<Cell title={text.capitalGold}>
							<span className="text-muted text-sm">+{formatNumber(capitalGold)}</span>
							<DailyTimer
								timer={dailies.capitalGold}
								now={now}
								name={text.capitalGold}
								onSetTime={(time) => actions.setResetTime("capitalGold", time)}
								onSetTimeAndUse={(time) =>
									actions.setResetTimeAndUse(
										"capitalGold",
										time,
										text.capitalGold
									)
								}
								onUse={() => actions.markTimerUsed("capitalGold", text.capitalGold)}
							/>
						</Cell>
					) : (
						<Cell
							title={text.capitalGold}
							requirement={text.townHall(CAPITAL_GOLD_TOWN_HALL)}
						/>
					))}
				<AutoForgeCell village={village} now={now} />
				<SlotsCell village={village} now={now} />
			</div>
			{seasonPassOpen(village) && <GoldPassCell village={village} now={now} />}
		</section>
	);
};
