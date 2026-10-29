"use client";

import { Badge, Button, Card } from "flowbite-react";
import { useState } from "react";
import { HiPencil, HiTrash } from "react-icons/hi";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { DeleteConfirmModal } from "@/comps/modals/DeleteConfirmModal";
import { EditPlaythroughModal } from "@/comps/modals/EditPlaythroughModal";
import type { PlaythroughCardProps } from "@/types/components/playthrough";

const PlaythroughCard = ({ playthrough }: PlaythroughCardProps) => {
	const { activePlaythrough, setActivePlaythrough, deletePlaythrough } = usePlaythrough();
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const isActive = activePlaythrough?.id === playthrough.id;

	const formatDate = (iso: string) =>
		new Date(iso).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	return (
		<>
			<Card className={`relative ${isActive ? "ring-2 ring-primary" : ""}`}>
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1">
						<h3 className="truncate text-lg font-semibold text-white">
							{playthrough.name}
						</h3>
						{isActive && (
							<Badge color="action" className="mt-1 w-fit">
								Active
							</Badge>
						)}
					</div>
					<div className="flex shrink-0 gap-1">
						<Button
							size="xs"
							color="gray"
							onClick={() => setIsEditOpen(true)}
							title="Edit village"
						>
							<HiPencil className="h-4 w-4" />
						</Button>
						<Button
							size="xs"
							color="red"
							onClick={() => setIsDeleteOpen(true)}
							title="Delete village"
						>
							<HiTrash className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{playthrough.description && (
					<p className="line-clamp-2 text-sm text-white/80">
						{playthrough.description}
					</p>
				)}

				<div className="mt-2 space-y-1 text-xs text-white/80">
					<p>Created: {formatDate(playthrough.createdAt)}</p>
					<p>Last modified: {formatDate(playthrough.lastModified)}</p>
				</div>

				{!isActive && (
					<Button
						color="action"
						size="sm"
						className="mt-2 w-full"
						onClick={() => setActivePlaythrough(playthrough.id)}
					>
						Set Active
					</Button>
				)}
			</Card>

			<EditPlaythroughModal
				isOpen={isEditOpen}
				currentPlaythrough={playthrough}
				onClose={() => setIsEditOpen(false)}
			/>

			<DeleteConfirmModal
				isOpen={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				onConfirm={() => deletePlaythrough(playthrough.id)}
				itemName={playthrough.name}
			/>
		</>
	);
}
export default PlaythroughCard;
