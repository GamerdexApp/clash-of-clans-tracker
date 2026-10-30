"use client";

import type { QueueTimelineProps } from "@/types/components/upgradeQueue";
import { commonText } from "@/lib/messages/common";
import { queueText } from "@/lib/messages/queue";
import { SegmentedControl } from "@/comps/ui/SegmentedControl";
import { Card } from "@/comps/ui/Card";

const text = queueText.timeline;
const ZOOMS = ["3", "7", "14", "30", "90"] as const;
const zoomOptions = () => ZOOMS.map((id) => ({ id, label: text.zooms[id] }));
const DAY_MS = 86_400_000;

export const QueueTimeline = ({ schedule, now, zoomDays, onZoomChange }: QueueTimelineProps) => {
	const windowMs = zoomDays * DAY_MS;
	const conflictIds = new Set(schedule.conflicts.map((conflict) => conflict.itemId));
	const position = (date: Date) => Math.min(100, Math.max(0, ((date.getTime() - now) / windowMs) * 100));
	const ticks = Array.from({ length: Math.min(zoomDays, 7) + 1 }, (_, index) => (index * zoomDays) / Math.min(zoomDays, 7));

	return (
		<Card className="flex flex-col gap-3 p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2 className="text-base font-semibold">{text.title}</h2>
				<SegmentedControl
					label={text.zoomLabel}
					options={zoomOptions()}
					value={String(zoomDays) as (typeof ZOOMS)[number]}
					onChange={(id) => onZoomChange(Number(id))}
				/>
			</div>
			<div className="relative ms-34 h-5" aria-hidden="true">
				{ticks.map((tick) => (
					<span
						key={tick}
						className={`text-muted absolute font-mono text-[11px] ${tick === zoomDays ? "-translate-x-full" : tick === 0 ? "" : "-translate-x-1/2"}`}
						style={{ left: `${(tick / zoomDays) * 100}%` }}
					>
						{tick === 0 ? text.now : `+${Math.round(tick * 10) / 10}d`}
					</span>
				))}
			</div>
			<ul className="flex flex-col gap-2">
				{schedule.lanes.map((lane) => (
					<li key={lane.slot.id} className="flex items-center gap-2">
						<span className="text-muted w-32 shrink-0 truncate font-mono text-xs">{lane.slot.label}</span>
						<div
							role="img"
							aria-label={text.laneLabel(lane.slot.label)}
							className="bg-track relative h-9 min-w-0 flex-1 overflow-hidden rounded-md"
						>
							{lane.active && (
								<span
									title={lane.active.label}
									className="bg-primary text-on-primary absolute inset-y-0 flex items-center overflow-hidden px-2 text-xs"
									style={{ left: 0, width: `${position(lane.active.endsAt)}%` }}
								>
									<span className="truncate">{lane.active.label}</span>
								</span>
							)}
							{lane.blocks.map(({ item, startsAt, endsAt }) => {
								const left = position(startsAt);
								const right = position(endsAt);
								if (right <= left) return null;
								const conflicting = conflictIds.has(item.id);
								return (
									<span
										key={item.id}
										title={commonText.queue.itemTitle(
											item.name,
											item.targetLevel
										)}
										className={`absolute inset-y-1 flex items-center overflow-hidden rounded px-2 text-xs ${
											conflicting ? "bg-surface border-danger text-danger border-[1.5px]" : "bg-tint border-primary text-ink border-[1.5px]"
										}`}
										style={{ left: `${left}%`, width: `${right - left}%` }}
									>
										<span className="truncate">
											{item.name} {item.targetLevel}
										</span>
									</span>
								);
							})}
						</div>
					</li>
				))}
			</ul>
			<div className="flex flex-col gap-1">
				<h3 className="font-medium">{text.conflictsTitle}</h3>
				{schedule.conflicts.length === 0 ? (
					<p className="text-muted">{text.noConflicts}</p>
				) : (
					<ul className="text-danger flex flex-col gap-1 text-sm">
						{schedule.conflicts.map((conflict) => (
							<li key={conflict.itemId}>
								{conflict.message} {conflict.fix}
							</li>
						))}
					</ul>
				)}
			</div>
		</Card>
	);
};
