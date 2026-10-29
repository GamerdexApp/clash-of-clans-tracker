"use client";

import { useMemo, useState } from "react";
import { LuPlus, LuSearch } from "react-icons/lu";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useUrlParams } from "@/lib/hooks/useUrlParams";
import { villagesText } from "@/lib/messages/villages";
import { filterAndSort, nextActiveAfterDelete } from "@/service/villageList";
import { PageHeader } from "@/comps/shell/PageHeader";
import { Button, ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Input } from "@/comps/ui/Input";
import { SegmentedControl } from "@/comps/ui/SegmentedControl";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough, SortOption } from "@/types/app";
import { CreateVillageDialog } from "./CreateVillageDialog";
import { DeleteVillageDialog } from "./DeleteVillageDialog";
import { EditVillageDialog } from "./EditVillageDialog";
import { VillageCard } from "./VillageCard";

const text = villagesText;
const SORTS: SortOption[] = ["lastModified", "createdAt", "name"];
const SORT_OPTIONS = SORTS.map((id) => ({ id, label: text.filters.sort[id] }));

export const VillagesPage = () => {
	const { playthroughs, activePlaythrough, setActivePlaythrough, deletePlaythrough, updateData } =
		usePlaythrough();
	const showToast = useToast();
	const params = useUrlParams();
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<SortOption>("lastModified");
	const [editing, setEditing] = useState<Playthrough | null>(null);
	const [deleting, setDeleting] = useState<Playthrough | null>(null);
	const [deletedLast, setDeletedLast] = useState(false);

	const creating = params.get("new") === "1";
	const openCreate = () => params.set({ new: "1" });
	const closeCreate = () => params.set({ new: null });

	const visible = useMemo(() => filterAndSort(playthroughs, search, sort), [playthroughs, search, sort]);

	const setActive = (village: Playthrough) => {
		setActivePlaythrough(village.id);
		showToast({ variant: "success", title: text.card.switched(village.name) });
	};

	const confirmDelete = (village: Playthrough) => {
		const previous = deletePlaythrough(village.id);
		if (!previous) return;
		setDeletedLast(previous.playthroughs.length === 1);
		showToast({
			variant: "success",
			title: text.delete.done(village.name),
			message: text.delete.doneMessage,
			action: {
				label: text.delete.undo,
				onAction: () => {
					updateData(() => previous);
					setDeletedLast(false);
				},
			},
		});
	};

	const subline = activePlaythrough
		? text.sublineActive(playthroughs.length, activePlaythrough.name)
		: text.subline(playthroughs.length);
	const deletingIsActive = deleting !== null && deleting.id === activePlaythrough?.id;
	const nextActive = deleting ? nextActiveAfterDelete(playthroughs, deleting.id) : null;

	const newVillageButton = (
		<Button variant="primary" onClick={openCreate}>
			<LuPlus size={16} aria-hidden="true" />
			{text.newVillage}
		</Button>
	);

	return (
		<>
			<PageHeader title={text.title} subline={subline} actions={newVillageButton} />
			{playthroughs.length === 0 ? (
				<EmptyState
					title={deletedLast ? text.empty.deletedTitle : text.empty.title}
					description={text.empty.description}
					actions={
						<>
							{newVillageButton}
							<ButtonLink href="/settings?tab=data" variant="link">
								{text.empty.restore}
							</ButtonLink>
						</>
					}
				/>
			) : (
				<>
					<Card className="flex flex-col gap-3 p-4">
						<div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
							<Input
								type="search"
								value={search}
								aria-label={text.filters.search}
								placeholder={text.filters.search}
								leadingIcon={<LuSearch size={16} aria-hidden="true" />}
								onChange={(event) => setSearch(event.target.value)}
							/>
							<SegmentedControl
								label={text.filters.sortLabel}
								options={SORT_OPTIONS}
								value={sort}
								onChange={setSort}
							/>
						</div>
						<div className="text-muted flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
							<span className="font-mono text-xs">
								{text.filters.showing(visible.length, playthroughs.length)}
							</span>
							{search.trim() !== "" && (
								<Button variant="link" onClick={() => setSearch("")}>
									{text.filters.clear}
								</Button>
							)}
						</div>
					</Card>
					{visible.length === 0 ? (
						<EmptyState
							title={text.noMatch.title(search.trim())}
							description={text.noMatch.description}
							actions={<Button onClick={() => setSearch("")}>{text.filters.clear}</Button>}
						/>
					) : (
						<div className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
							{visible.map((village) => (
								<VillageCard
									key={village.id}
									village={village}
									isActive={village.id === activePlaythrough?.id}
									onSetActive={() => setActive(village)}
									onEdit={() => setEditing(village)}
									onDelete={() => setDeleting(village)}
								/>
							))}
						</div>
					)}
				</>
			)}
			<CreateVillageDialog open={creating} onClose={closeCreate} />
			<EditVillageDialog village={editing} onClose={() => setEditing(null)} />
			<DeleteVillageDialog
				village={deleting}
				isActive={deletingIsActive}
				nextActiveName={nextActive?.name ?? null}
				onConfirm={confirmDelete}
				onClose={() => setDeleting(null)}
			/>
		</>
	);
};
