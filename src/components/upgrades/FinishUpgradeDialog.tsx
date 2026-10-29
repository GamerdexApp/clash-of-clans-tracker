"use client";

import { useState } from "react";

import { formatCountdown, formatDuration } from "@/lib/format";
import { upgradeText } from "@/lib/messages/upgrades";
import { getGemCost } from "@/lib/utils/upgradeHelpers";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";
import { RadioGroup } from "@/comps/ui/RadioGroup";
import type { FinishMethod } from "@/types/app/engine";
import type { FinishUpgradeDialogProps, RunningSubject } from "@/types/components/upgrades";

const text = upgradeText.finish;
const METHODS: FinishMethod[] = ["timePassed", "gems", "book", "hammer"];
const OPTIONS = METHODS.map((id) => ({ id, label: text.methods[id].label }));

const FinishContent = ({
	subject,
	now,
	onConfirm,
	onClose,
}: Omit<FinishUpgradeDialogProps, "subject"> & { subject: RunningSubject }) => {
	const [method, setMethod] = useState<FinishMethod>("timePassed");
	const remaining = Math.max(0, Date.parse(subject.finishesAt) - now);

	const stores = [
		text.storesLevel(subject.fromLevel + 1),
		method === "timePassed" ? text.storesSavedNone : text.storesSaved(formatDuration(remaining)),
		method === "gems" ? text.gemFigure(getGemCost(remaining)) : "",
		text.notTracked[method],
	]
		.filter(Boolean)
		.join(" ");

	return (
		<Dialog
			open
			onClose={onClose}
			title={text.title}
			description={`${subject.name}, Lv ${subject.fromLevel} to ${subject.fromLevel + 1}, ${subject.builderLabel}, ${formatCountdown(remaining)} ${text.left}`}
			footer={
				<>
					<Button onClick={onClose}>{text.keep}</Button>
					<Button
						variant="primary"
						onClick={() => {
							onConfirm(method);
							onClose();
						}}
					>
						{text.confirm}
					</Button>
				</>
			}
		>
			<RadioGroup label={text.methodLabel} options={OPTIONS} value={method} onChange={setMethod} />
			<p className="text-muted">{text.methods[method].description}</p>
			<div className="bg-bg flex flex-col gap-1 rounded-md p-3">
				<span className="font-semibold">{text.stores}</span>
				<span>{stores}</span>
			</div>
		</Dialog>
	);
};

export const FinishUpgradeDialog = ({ subject, ...props }: FinishUpgradeDialogProps) =>
	subject ? <FinishContent subject={subject} {...props} /> : null;
