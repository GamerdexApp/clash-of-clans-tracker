"use client";

import { LuArrowDown, LuArrowUp, LuPlus, LuTrash2 } from "react-icons/lu";

import { formatCountdown, formatDuration, formatNumber } from "@/lib/format";
import { queueText } from "@/lib/messages/queue";
import { queueStartBlocker, stepForItem, targetForItem } from "@/service/upgradeQueue";
import { boostedStep } from "@/service/upgradeEngine";
import { boostForLane } from "@/service/goldPass";
import { targetName } from "@/service/upgradeLabels";
import { Badge } from "@/comps/ui/Badge";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { IconButton } from "@/comps/ui/IconButton";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import { Select } from "@/comps/ui/Select";
import type { LaneCardProps } from "@/types/components/upgradeQueue";

const text = queueText.lane;

export const LaneCard = ({ lane: kind, village, schedule: lane, lanes, conflicts, now, onAdd, onRemove, onMove, onStartNow }: LaneCardProps) => {
	const laneText = queueText.lanes[kind];
	const boostPercent = boostForLane(kind, village, new Date(now));
	const conflictFor = (itemId: string) => conflicts.find((conflict) => conflict.itemId === itemId);
	const others = lanes.filter((other) => other.slot.id !== lane.slot.id);
	const first = lane.blocks[0]?.item;
	const firstBlocker = first ? queueStartBlocker(village, first) : null;
	const laneBusy = lane.active !== null;

	const progress = lane.active
		? (now - lane.active.startsAt.getTime()) / Math.max(1, lane.active.endsAt.getTime() - lane.active.startsAt.getTime())
		: 0;

	return (
		<Card role="group" aria-label={lane.slot.label} className="flex flex-col gap-3 p-4">
			<div className="flex items-center justify-between gap-3">
				<h3 className="text-base font-semibold">{lane.slot.label}</h3>
				<Button onClick={() => onAdd(lane.slot.id)}>
					<LuPlus size={16} aria-hidden="true" />
					{laneText.add.title}
				</Button>
			</div>
			{lane.active ? (
				<div className="bg-bg flex flex-col gap-1.5 rounded-md p-3">
					<span className="font-medium">{lane.active.label}</span>
					<span className="font-mono text-sm">{formatCountdown(lane.active.endsAt.getTime() - now)}</span>
					<ProgressBar value={progress} label={`${lane.slot.label} progress`} />
				</div>
			) : (
				<p className="text-muted">{text.idle}</p>
			)}
			{lane.blocks.length === 0 ? (
				<p className="text-muted">{text.queueEmpty}</p>
			) : (
				<ol className="flex flex-col gap-2">
					{lane.blocks.map(({ item, boostedMs }, index) => {
						const conflict = conflictFor(item.id);
						const target = targetForItem(item);
						const cost = boostedStep(stepForItem(item), boostPercent, kind).cost;
						return (
							<li
								key={item.id}
								className={`flex flex-col gap-2 rounded-md border-[1.5px] p-2.5 ${conflict ? "border-danger" : "border-line"}`}
							>
								<div className="flex flex-wrap items-start justify-between gap-2">
									<div className="flex min-w-0 flex-col">
										<span className="truncate font-medium">
											{index + 1}. {targetName(target)}
										</span>
										<span className="text-muted text-xs">
											{text.levels(item.targetLevel - 1, item.targetLevel)}, {formatDuration(boostedMs)},{" "}
											{formatNumber(cost)} {item.costResource}
										</span>
									</div>
									{conflict && <Badge tone="warn">Conflict</Badge>}
								</div>
								{conflict && (
									<p className="text-danger text-xs font-medium">
										{conflict.message} {conflict.fix}
									</p>
								)}
								<div className="flex flex-wrap items-center gap-2">
									<IconButton
										label={`${text.moveUp}, ${targetName(target)}`}
										disabled={index === 0}
										onClick={() => onMove(item.id, lane.slot.id, index - 1)}
										className="border-line bg-surface hover:bg-tint border-[1.5px]"
									>
										<LuArrowUp size={16} aria-hidden="true" />
									</IconButton>
									<IconButton
										label={`${text.moveDown}, ${targetName(target)}`}
										disabled={index === lane.blocks.length - 1}
										onClick={() => onMove(item.id, lane.slot.id, index + 1)}
										className="border-line bg-surface hover:bg-tint border-[1.5px]"
									>
										<LuArrowDown size={16} aria-hidden="true" />
									</IconButton>
									{others.length > 0 && (
										<Select
											aria-label={`${text.moveToLane}, ${targetName(target)}`}
											value=""
											className="w-auto"
											onChange={(event) => {
												if (event.target.value) onMove(item.id, Number(event.target.value), Number.MAX_SAFE_INTEGER);
											}}
										>
											<option value="">{text.moveToLane}</option>
											{others.map((other) => (
												<option key={other.slot.id} value={other.slot.id}>
													{other.slot.label}
												</option>
											))}
										</Select>
									)}
									<IconButton
										label={`${text.remove}, ${targetName(target)}`}
										onClick={() => onRemove(item)}
										className="border-danger text-danger hover:bg-tint border-[1.5px]"
									>
										<LuTrash2 size={16} aria-hidden="true" />
									</IconButton>
								</div>
							</li>
						);
					})}
				</ol>
			)}
			{first && (
				<div className="flex flex-col gap-1">
					<div>
						<Button
							variant="primary"
							disabled={laneBusy || firstBlocker !== null}
							onClick={() => onStartNow(lane.slot.id, first)}
						>
							{text.startNow}
						</Button>
					</div>
					{(laneBusy || firstBlocker) && <p className="text-muted text-xs">{laneBusy ? laneText.laneBusy : firstBlocker}</p>}
				</div>
			)}
		</Card>
	);
};
