"use client";

import { useState } from "react";

import { massEditText } from "@/lib/messages/massEdit";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";

const text = massEditText;

interface ActionBarProps {
	count: number;
	onDiscard: () => void;
	onSave: () => void;
}

/** Pinned to the bottom of the page. Discard asks first, because it throws every change away. */
export const ActionBar = ({ count, onDiscard, onSave }: ActionBarProps) => {
	const [confirming, setConfirming] = useState(false);
	return (
		<>
			<div className="bg-surface border-line sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] px-4 py-3 lg:mx-0 lg:rounded-md lg:border-[1.5px]">
				<span role="status" className={count > 0 ? "font-medium" : "text-muted"}>
					{count > 0 ? text.bar.unsaved(count) : text.bar.none}
				</span>
				<div className="flex gap-2">
					<Button disabled={count === 0} onClick={() => setConfirming(true)}>
						{text.bar.discard}
					</Button>
					<Button variant="primary" disabled={count === 0} onClick={onSave}>
						{text.bar.save}
					</Button>
				</div>
			</div>
			<Dialog
				open={confirming}
				onClose={() => setConfirming(false)}
				title={text.discardDialog.title(count)}
				footer={
					<>
						<Button onClick={() => setConfirming(false)}>{text.discardDialog.keep}</Button>
						<Button
							variant="danger"
							onClick={() => {
								setConfirming(false);
								onDiscard();
							}}
						>
							{text.discardDialog.discard}
						</Button>
					</>
				}
			>
				<p className="text-muted">{text.discardDialog.body}</p>
			</Dialog>
		</>
	);
};
