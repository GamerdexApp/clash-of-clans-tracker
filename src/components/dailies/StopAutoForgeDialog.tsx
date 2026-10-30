"use client";

import { formatNumber, formatTimeLeft } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import { autoCycleEnd, forgeResource, formatResourceAmount } from "@/service/forge";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";
import type { AutoForgeData } from "@/types/app/playthrough";

const text = dailiesText.forge.auto;

interface StopAutoForgeDialogProps {
	open: boolean;
	auto: AutoForgeData;
	now: Date;
	onClose: () => void;
	onStop: () => void;
}

/** Stopping Auto Forge ends a repeating run, so it asks first and then offers Undo. */
export const StopAutoForgeDialog = ({ open, auto, now, onClose, onStop }: StopAutoForgeDialogProps) => {
	const end = autoCycleEnd(auto, now);
	const left = end === null ? 0 : end - now.getTime();
	return (
		<Dialog
			open={open}
			onClose={onClose}
			title={text.confirm.title}
			description={text.confirm.body(
				formatResourceAmount(auto.resourceAmount),
				forgeResource(auto.resourceType).label,
				formatNumber(auto.capitalGoldOutput),
				formatTimeLeft(left),
			)}
			footer={
				<>
					<Button onClick={onClose}>{text.confirm.keep}</Button>
					<Button
						variant="danger"
						onClick={() => {
							onClose();
							onStop();
						}}
					>
						{text.confirm.stop}
					</Button>
				</>
			}
		>
			<p className="text-muted">{text.confirm.undoHint}</p>
		</Dialog>
	);
};
