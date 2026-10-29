"use client";

import { builderText } from "@/lib/messages/builder";
import { formatCountdown } from "@/lib/format";
import { builderSlots, freeBuilderCount, readLevel } from "@/service/upgradeEngine";
import { targetName } from "@/service/upgradeLabels";
import { Badge } from "@/comps/ui/Badge";
import { ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Note } from "@/comps/ui/Note";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import type { Playthrough } from "@/types/app";
import type { RunningUpgrade } from "@/types/app/engine";

const text = builderText.builders;

const taskLine = (village: Playthrough, running: RunningUpgrade) => {
	const from = readLevel(village, running.target);
	return `${targetName(running.target)} ${text.taskLevels(from, from + 1)}`;
};

const progressOf = (running: RunningUpgrade, now: number) => {
	const start = Date.parse(running.upgrade.upgradeStartedAt);
	const end = Date.parse(running.upgrade.finishesAt);
	return end > start ? (now - start) / (end - start) : 1;
};

interface TileProps {
	label: string;
	village: Playthrough;
	running: RunningUpgrade | null;
	now: number;
	note?: string;
}

const Tile = ({ label, village, running, now, note }: TileProps) => (
	<li className="border-line bg-bg flex min-w-0 flex-col gap-1.5 rounded-md border-[1.5px] p-2.5">
		<span className="text-muted font-mono text-xs">{label}</span>
		{running ? (
			<>
				<span className="truncate font-medium">{taskLine(village, running)}</span>
				<span className="font-mono text-xs">
					{formatCountdown(Date.parse(running.upgrade.finishesAt) - now)}
				</span>
				<ProgressBar value={progressOf(running, now)} label={`${label} progress`} />
			</>
		) : (
			<span className="text-muted">{note ?? text.idle}</span>
		)}
	</li>
);

export const BuildersStrip = ({ village, goblin, now }: { village: Playthrough; goblin: boolean; now: number }) => {
	const state = builderSlots(village, goblin);
	const free = freeBuilderCount(state);

	return (
		<Card className="flex flex-col gap-3 p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<h2 className="text-base font-semibold">{text.title}</h2>
					<Badge tone={free > 0 ? "kept" : "warn"}>{text.free(free, state.slots.length)}</Badge>
				</div>
				<ButtonLink href="/builder/queue" variant="secondary">
					{text.openQueue}
				</ButtonLink>
			</div>
			{state.slots.length === 0 && state.unassigned.length === 0 ? (
				<Note>{text.noBuilders}</Note>
			) : (
				<ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
					{state.slots.map((slot) => (
						<Tile key={slot.id} label={slot.label} village={village} running={slot.running} now={now} />
					))}
					{state.unassigned.map((running, index) => (
						<Tile
							key={`unassigned-${index}`}
							label={text.unassigned}
							village={village}
							running={running}
							now={now}
						/>
					))}
				</ul>
			)}
			{state.unassigned.length > 0 && <Note tone="warning">{text.unassignedHelp}</Note>}
		</Card>
	);
};
