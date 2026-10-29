"use client";

import { useState } from "react";

import { formatDuration, formatFinishTime, formatNumber } from "@/lib/format";
import { upgradeText } from "@/lib/messages/upgrades";
import { boostedStep, isInstantStep, requirementBlock } from "@/service/upgradeEngine";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";
import { Note } from "@/comps/ui/Note";
import { RadioGroup } from "@/comps/ui/RadioGroup";
import type { StartUpgradeDialogProps, StartUpgradeSubject } from "@/types/components/upgrades";

const text = upgradeText.start;

const StartContent = ({
	subject,
	village,
	boostPercent,
	lane,
	lanes,
	now,
	onConfirm,
	onClose,
}: Omit<StartUpgradeDialogProps, "subject"> & { subject: StartUpgradeSubject }) => {
	const { step } = subject;
	const instant = isInstantStep(step);
	const laneText = text.lanes[lane];
	const boosted = boostedStep(step, boostPercent, lane);
	const missing = requirementBlock(village, step);
	const freeSlots = lanes.filter((slot) => slot.running === null);
	const [chosen, setChosen] = useState<number | null>(freeSlots.length === 1 ? freeSlots[0].id : null);
	const builderId = instant ? 0 : chosen;
	const canStart = missing === null && (instant || builderId !== null);

	const doneAt = new Date(now + boosted.durationMs);
	const costChanged = boosted.cost !== step.cost;

	return (
		<Dialog
			open
			onClose={onClose}
			title={text.title}
			description={`${subject.name}, ${text.levelChange(subject.fromLevel, step.level)}`}
			footer={
				<>
					<Button onClick={onClose}>{text.cancel}</Button>
					<Button
						variant="primary"
						disabled={!canStart}
						onClick={() => {
							if (builderId === null) return;
							onConfirm(builderId);
							onClose();
						}}
					>
						{instant ? text.confirmInstant : text.confirm}
					</Button>
				</>
			}
		>
			<dl className="bg-bg grid grid-cols-3 gap-3 rounded-md p-3">
				<div className="flex flex-col">
					<dt className="text-muted text-xs">{text.time}</dt>
					<dd className="font-mono font-medium">{formatDuration(boosted.durationMs)}</dd>
					{boostPercent > 0 && !instant && (
						<dd className="text-muted text-xs">
							{text.wasBoosted(formatDuration(step.durationMs), boostPercent)}
						</dd>
					)}
				</div>
				<div className="flex flex-col">
					<dt className="text-muted text-xs">{text.cost}</dt>
					<dd className="font-mono font-medium">{formatNumber(boosted.cost)}</dd>
					<dd className="text-muted text-xs">
						{costChanged ? text.wasCost(formatNumber(step.cost), step.costResource) : step.costResource}
					</dd>
				</div>
				<div className="flex flex-col">
					<dt className="text-muted text-xs">{text.doneAt}</dt>
					<dd className="font-mono font-medium">{instant ? "Now" : formatFinishTime(doneAt)}</dd>
					{!instant && (
						<dd className="text-muted text-xs">{lane === "bbBuilder" || lane === "bbResearch" ? text.storedNoteUnboosted : text.storedNote}</dd>
					)}
				</div>
			</dl>
			{missing ? (
				<Note tone="warning">{text.requires[missing.building](missing.level)}</Note>
			) : instant ? (
				<Note>{text.instant}</Note>
			) : freeSlots.length === 0 ? (
				<Note tone="warning">{laneText.noneFree}</Note>
			) : (
				<>
					<RadioGroup
						label={laneText.label}
						options={freeSlots.map((slot) => ({ id: String(slot.id), label: `${slot.label}, ${text.free}` }))}
						value={chosen === null ? "" : String(chosen)}
						onChange={(id) => setChosen(Number(id))}
					/>
					{chosen === null && <p className="text-muted">{laneText.choose}</p>}
				</>
			)}
		</Dialog>
	);
};

export const StartUpgradeDialog = ({ subject, ...props }: StartUpgradeDialogProps) =>
	subject ? <StartContent subject={subject} {...props} /> : null;
