"use client";

import { massEditText } from "@/lib/messages/massEdit";
import type { RowChange } from "@/service/massEdit";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";

const text = massEditText.confirm;
const LINES_SHOWN = 12;

interface BulkConfirmDialogProps {
	/** The planned changes, or null when no confirm is open. */
	changes: RowChange[] | null;
	onConfirm: () => void;
	onClose: () => void;
}

/** An action that lowers rows lists them first. It changes only the draft. */
export const BulkConfirmDialog = ({ changes, onConfirm, onClose }: BulkConfirmDialogProps) => {
	const lowered = changes?.filter((change) => change.to < change.from) ?? [];
	const touchesSupercharge = lowered.some((change) => change.row.supercharge);
	return (
		<Dialog
			open={changes !== null}
			onClose={onClose}
			title={text.title(lowered.length)}
			description={text.body}
			footer={
				<>
					<Button onClick={onClose}>{text.cancel}</Button>
					<Button variant="primary" onClick={onConfirm}>
						{text.apply}
					</Button>
				</>
			}
		>
			<ul className="flex flex-col gap-1">
				{lowered.slice(0, LINES_SHOWN).map((change) => (
					<li key={change.row.key}>{text.line(change.row.label, change.from, change.to)}</li>
				))}
				{lowered.length > LINES_SHOWN && <li className="text-muted">{text.more(lowered.length - LINES_SHOWN)}</li>}
			</ul>
			{touchesSupercharge && <p className="text-muted mt-3">{text.superchargeNote}</p>}
		</Dialog>
	);
};
