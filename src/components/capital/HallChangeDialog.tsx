"use client";

import { capitalText } from "@/lib/messages/capital";
import type { HallChange } from "@/service/capital";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";

const text = capitalText.confirm;
const LINES_SHOWN = 12;

interface HallChangeDialogProps {
	change: HallChange | null;
	onConfirm: () => void;
	onClose: () => void;
}

/** Lowering a hall lists exactly what resets before anything is written. */
export const HallChangeDialog = ({ change, onConfirm, onClose }: HallChangeDialogProps) => {
	const lines = change?.resets.flatMap((reset) => reset.lines.map((line) => `${reset.zone}: ${line}`)) ?? [];
	return (
		<Dialog
			open={change !== null}
			onClose={onClose}
			title={text.title}
			description={text.description}
			footer={
				<>
					<Button onClick={onClose}>{text.cancel}</Button>
					<Button variant="primary" onClick={onConfirm}>
						{text.confirm}
					</Button>
				</>
			}
		>
			<ul className="flex flex-col gap-1">
				{lines.slice(0, LINES_SHOWN).map((line) => (
					<li key={line}>{line}</li>
				))}
				{lines.length > LINES_SHOWN && <li className="text-muted">{text.more(lines.length - LINES_SHOWN)}</li>}
			</ul>
		</Dialog>
	);
};
