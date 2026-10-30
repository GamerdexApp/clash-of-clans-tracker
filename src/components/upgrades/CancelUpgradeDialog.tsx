"use client";

import { formatCountdown, formatNumber } from "@/lib/format";
import { upgradeText } from "@/lib/messages/upgrades";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";
import { Note } from "@/comps/ui/Note";
import type { CancelUpgradeDialogProps } from "@/types/components/upgrades";

const text = upgradeText.cancel;
const REFUND_SHARE = 0.5;

export const CancelUpgradeDialog = ({ subject, now, onConfirm, onClose }: CancelUpgradeDialogProps) => {
	const paid = subject?.step?.cost ?? 0;
	const remaining = subject ? Math.max(0, Date.parse(subject.finishesAt) - now) : 0;

	return (
		<Dialog
			open={subject !== null}
			onClose={onClose}
			title={text.title}
			description={
				subject
					? `${subject.name}, Lv ${subject.fromLevel} to ${subject.fromLevel + 1}, ${subject.builderLabel}, ${formatCountdown(remaining)} left`
					: undefined
			}
			footer={
				<>
					<Button data-autofocus onClick={onClose}>
						{text.keep}
					</Button>
					<Button
						variant="danger"
						onClick={() => {
							onConfirm();
							onClose();
						}}
					>
						{text.confirm}
					</Button>
				</>
			}
		>
			{subject && (
				<>
					<p>{text.body(subject.name, subject.fromLevel, subject.builderLabel)}</p>
					{paid > 0 && subject.step && (
						<Note title={text.refundTitle}>
							{text.refundBody(
								formatNumber(Math.floor(paid * REFUND_SHARE)),
								formatNumber(paid),
								subject.step.costResource
							)}
						</Note>
					)}
					<p className="text-muted">{text.undoNote}</p>
				</>
			)}
		</Dialog>
	);
};
