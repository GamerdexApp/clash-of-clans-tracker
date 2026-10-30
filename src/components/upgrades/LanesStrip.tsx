"use client";

import { formatCountdown } from "@/lib/format";
import { commonText } from "@/lib/messages/common";
import { upgradeText } from "@/lib/messages/upgrades";
import { freeBuilderCount, readLevel } from "@/service/upgradeEngine";
import { targetName } from "@/service/upgradeLabels";
import { Badge } from "@/comps/ui/Badge";
import { ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Note } from "@/comps/ui/Note";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import type { Playthrough } from "@/types/app";
import type { RunningUpgrade } from "@/types/app/engine";
import type { LanesStripProps } from "@/types/components/upgrades";

const text = upgradeText.strip;

const taskLine = (village: Playthrough, running: RunningUpgrade) => {
	const from = readLevel(village, running.target);
	return `${targetName(running.target)} ${text.taskLevels(from, from + 1)}`;
};

const progressOf = (running: RunningUpgrade, now: number) => {
	const start = Date.parse(running.upgrade.upgradeStartedAt);
	const end = Date.parse(running.upgrade.finishesAt);
	return end > start ? (now - start) / (end - start) : 1;
};

const Tile = ({
	label,
	village,
	running,
	now,
}: {
	label: string;
	village: Playthrough;
	running: RunningUpgrade | null;
	now: number;
}) => (
	<li className="border-line bg-bg flex min-w-0 flex-col gap-1.5 rounded-md border-[1.5px] p-2.5">
		<span className="text-muted font-mono text-xs">{label}</span>
		{running ? (
			<>
				<span className="truncate font-medium">{taskLine(village, running)}</span>
				<span className="font-mono text-xs">
					{formatCountdown(Date.parse(running.upgrade.finishesAt) - now)}
				</span>
				<ProgressBar
					value={progressOf(running, now)}
					label={commonText.progressLabel(label)}
				/>
			</>
		) : (
			<span className="text-muted">{text.idle}</span>
		)}
	</li>
);

/** One tile per lane with the task, the time left and a bar. Builders, research and pets all use it. */
export const LanesStrip = ({
	title,
	village,
	state,
	now,
	queueHref,
	queueLabel,
	stats,
	actions,
	emptyNote,
	unassignedHelp,
	gridClassName = "sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7",
}: LanesStripProps) => {
	const free = freeBuilderCount(state);

	return (
		<Card className="flex flex-col gap-3 p-4">
			<div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
				<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
					<div className="flex items-center gap-3">
						<h2 className="text-base font-semibold">{title}</h2>
						<Badge tone={free > 0 ? "kept" : "warn"}>{text.free(free, state.slots.length)}</Badge>
					</div>
					{stats && (
						<dl className="flex flex-wrap gap-x-6 gap-y-2">
							{stats.map((stat) => (
								<div key={stat.label} className="flex flex-col">
									<dt className="text-muted text-xs">{stat.label}</dt>
									<dd className="font-mono font-medium">{stat.value}</dd>
								</div>
							))}
						</dl>
					)}
				</div>
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
					{actions}
					{queueHref && (
						<ButtonLink href={queueHref} variant="secondary">
							{queueLabel}
						</ButtonLink>
					)}
				</div>
			</div>
			{state.slots.length === 0 && state.unassigned.length === 0 ? (
				<Note>{emptyNote}</Note>
			) : (
				<ul className={`grid gap-2 ${gridClassName}`}>
					{state.slots.map((slot) => (
						<Tile key={slot.id} label={slot.label} village={village} running={slot.running} now={now} />
					))}
					{state.unassigned.map((running, index) => (
						<Tile key={`unassigned-${index}`} label={text.unassigned} village={village} running={running} now={now} />
					))}
				</ul>
			)}
			{state.unassigned.length > 0 && <Note tone="warning">{unassignedHelp}</Note>}
		</Card>
	);
};
