"use client";

import type { FirstSyncChoice } from "@gamerdexapp/gamerdex-sync";
import { useState } from "react";
import { type PendingChoice, useSync } from "@/lib/contexts/SyncContext";
import { formatNumber } from "@/lib/format";
import { syncText } from "@/lib/messages/sync";
import type { SyncDocument } from "@/lib/sync/document";
import { fromSyncShape } from "@/lib/sync/shape";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";

const text = syncText;

const options = () =>
	[
		{ choice: "merge", label: text.choice.merge, hint: text.choice.mergeHint },
		{ choice: "keep-local", label: text.choice.keepLocal, hint: text.choice.keepLocalHint },
		{ choice: "keep-cloud", label: text.choice.keepCloud, hint: text.choice.keepCloudHint },
	] as const;

const Summary = ({ title, data }: { title: string; data: SyncDocument }) => {
	const villages = fromSyncShape(data).playthroughs ?? [];
	return (
		<div className="border-line bg-surface flex flex-col gap-1 rounded-md border-[1.5px] p-3">
			<span className="font-semibold">{title}</span>
			<span className="text-muted">
				{text.villageCount(villages.length, formatNumber(villages.length))}
			</span>
			<span className="font-mono text-xs break-words">
				{villages.map((village) => village.name).join(", ")}
			</span>
		</div>
	);
};

interface FirstSyncDialogProps {
	open: boolean;
	choice: PendingChoice;
	onLater: () => void;
}

export const FirstSyncDialog = ({ open, choice, onLater }: FirstSyncDialogProps) => {
	const { syncNow, status } = useSync();
	const [picked, setPicked] = useState<FirstSyncChoice>("merge");
	const working = status === "syncing";

	return (
		<Dialog
			open={open}
			onClose={onLater}
			title={text.choice.title}
			description={text.choice.body}
			variant="wide"
			footer={
				<>
					<Button disabled={working} onClick={onLater}>
						{text.first.later}
					</Button>
					<Button
						variant="primary"
						loading={working}
						onClick={() => void syncNow(picked)}
					>
						{working ? text.status.syncing : text.first.apply}
					</Button>
				</>
			}
		>
			<div className="grid gap-3 sm:grid-cols-2">
				<Summary title={text.first.thisDevice} data={choice.local} />
				<Summary title={text.first.cloud} data={choice.remote} />
			</div>
			<fieldset disabled={working} className="mt-4 flex flex-col gap-2">
				<legend className="sr-only">{text.first.optionsLabel}</legend>
				{options().map((option) => (
					<label
						key={option.choice}
						className={`flex items-start gap-3 rounded-md border-[1.5px] p-3 ${working ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${
							picked === option.choice
								? "border-primary bg-tint"
								: "border-line bg-surface"
						}`}
					>
						<input
							type="radio"
							name="first-sync-choice"
							checked={picked === option.choice}
							onChange={() => setPicked(option.choice)}
							className="accent-primary mt-1 size-4"
						/>
						<span className="flex flex-col gap-0.5">
							<span className="font-semibold">
								{option.label}
								{option.choice === "merge" && (
									<span className="text-link ms-2 text-xs">
										{text.first.recommended}
									</span>
								)}
							</span>
							<span className="text-muted">{option.hint}</span>
						</span>
					</label>
				))}
			</fieldset>
		</Dialog>
	);
};
