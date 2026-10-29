"use client";

import { LuTriangleAlert } from "react-icons/lu";

import { villagesText } from "@/lib/messages/villages";
import { Button, ButtonLink } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";
import type { Playthrough } from "@/types/app";

const text = villagesText.delete;

interface DeleteVillageDialogProps {
	village: Playthrough | null;
	isActive: boolean;
	nextActiveName: string | null;
	onConfirm: (village: Playthrough) => void;
	onClose: () => void;
}

export const DeleteVillageDialog = ({
	village,
	isActive,
	nextActiveName,
	onConfirm,
	onClose,
}: DeleteVillageDialogProps) => (
	<Dialog
		open={village !== null}
		onClose={onClose}
		title={text.title}
		description={text.description}
		footer={
			<>
				<Button data-autofocus onClick={onClose}>
					{text.cancel}
				</Button>
				<Button
					variant="danger"
					onClick={() => {
						if (village) onConfirm(village);
						onClose();
					}}
				>
					{text.confirm}
				</Button>
			</>
		}
	>
		{village && (
			<>
				<div className="bg-bg flex flex-col gap-2 rounded-md p-3">
					<p className="flex items-start gap-2">
						<LuTriangleAlert size={18} aria-hidden="true" className="text-danger mt-0.5 shrink-0" />
						<span>{text.question(village.name)}</span>
					</p>
					{isActive && (
						<p className="text-muted">
							{nextActiveName ? text.activeNext(nextActiveName) : text.activeLast}
						</p>
					)}
				</div>
				<div>
					<ButtonLink href="/settings?tab=data" variant="link">
						{text.exportFirst}
					</ButtonLink>
				</div>
			</>
		)}
	</Dialog>
);
