"use client";

import { useState } from "react";

import { formatCountdown, formatDuration } from "@/lib/format";
import { commonText } from "@/lib/messages/common";
import { upgradeText } from "@/lib/messages/upgrades";
import { getGemCost } from "@/lib/utils/upgradeHelpers";
import { laneKindOf } from "@/service/upgradeEngine";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";
import { RadioGroup } from "@/comps/ui/RadioGroup";
import type { FinishMethod } from "@/types/app/engine";
import type { FinishUpgradeDialogProps, RunningSubject } from "@/types/components/upgrades";

const text = upgradeText.finish;
const BUILDER_METHODS: FinishMethod[] = ["timePassed", "gems", "book", "hammer"];
const RESEARCH_METHODS: FinishMethod[] = ["timePassed", "gems"];
const optionsFor = (methods: FinishMethod[]) => methods.map((id) => ({ id, label: text.methods[id].label }));

const FinishContent = ({
	subject,
	now,
	onConfirm,
	onClose,
}: Omit<FinishUpgradeDialogProps, "subject"> & { subject: RunningSubject }) => {
	const [method, setMethod] = useState<FinishMethod>("timePassed");
	const remaining = Math.max(0, Date.parse(subject.finishesAt) - now);
	const options = optionsFor(laneKindOf(subject.target) === "builder" ? BUILDER_METHODS : RESEARCH_METHODS);

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
			description={commonText.finishDescription(
				subject.name,
				subject.fromLevel,
				subject.fromLevel + 1,
				subject.builderLabel,
				formatCountdown(remaining),
				text.left
			)}
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
			<RadioGroup label={text.methodLabel} options={options} value={method} onChange={setMethod} />
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
