"use client";

import Link from "next/link";
import { useState } from "react";
import type { Playthrough } from "@/types/app";
import { useMassEditDraft } from "@/lib/hooks/useMassEditDraft";
import { useUrlTab } from "@/lib/hooks/useUrlTab";
import { massEditText } from "@/lib/messages/massEdit";
import {
	type BulkAction,
	categoryProgress,
	homeCategories,
	lowers,
	type MassCategory,
	type MassRow,
	planBulk,
	type RowChange,
	writeRow,
} from "@/service/massEdit";
import { clanCapitalState, lockedRequirement } from "@/service/navAccess";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { Badge } from "@/comps/ui/Badge";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { ActionBar } from "./ActionBar";
import { BulkConfirmDialog } from "./BulkConfirmDialog";
import { BulkToolbar, type ToolbarAction } from "./BulkToolbar";
import { CategoryPicker } from "./CategoryPicker";
import { RowList } from "./RowList";
import { WallsPanel } from "./WallsPanel";

const text = massEditText;

interface ScopeLink {
	id: "builder" | "capital";
	href: string;
	requirement: string | null;
}

const scopeLinks = (village: Playthrough): ScopeLink[] => {
	const capital = clanCapitalState(village);
	return [
		{
			id: "builder",
			href: "/mass-edit/builder",
			requirement: lockedRequirement("builderBaseUpgrades", village),
		},
		{
			id: "capital",
			href: "/mass-edit/capital",
			requirement:
				capital === "locked"
					? lockedRequirement("districts", village)
					: capital === "off"
						? text.trackingOff
						: null,
		},
	];
};

const ScopeNav = ({ village, homeCount }: { village: Playthrough; homeCount: number }) => (
	<nav aria-label={text.scopeNav} className="flex flex-wrap gap-2">
		<span
			aria-current="page"
			className="border-primary bg-tint flex min-h-11 items-center gap-2 rounded-md border-[1.5px] px-4 font-medium lg:min-h-9"
		>
			{text.scopes.home}
			{homeCount > 0 && <Badge tone="changed">{text.changedCount(homeCount)}</Badge>}
		</span>
		{scopeLinks(village).map((scope) =>
			scope.requirement ? (
				<span
					key={scope.id}
					className="border-line text-muted bg-tint flex min-h-11 flex-col justify-center rounded-md border-[1.5px] border-dashed px-4 leading-tight lg:min-h-9"
				>
					<span className="font-medium">{text.scopes[scope.id]}</span>
					<span className="text-xs">
						{scope.requirement === text.trackingOff
							? scope.requirement
							: text.requires(scope.requirement)}
					</span>
				</span>
			) : (
				<Link
					key={scope.id}
					href={scope.href}
					className="border-line bg-surface hover:bg-tint flex min-h-11 items-center rounded-md border-[1.5px] px-4 font-medium lg:min-h-9"
				>
					{text.scopes[scope.id]}
				</Link>
			)
		)}
	</nav>
);

const MassEditView = ({ village }: { village: Playthrough }) => {
	const { draft, categories, changes, edit, applyChanges, discard, save } =
		useMassEditDraft(village);
	const townHall = village.data.homeVillage.townHallLevel;
	const ids = categories.map((category) => category.id);
	const [categoryId, setCategoryId] = useUrlTab(ids, ids[0]);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [pending, setPending] = useState<RowChange[] | null>(null);
	const category: MassCategory =
		categories.find((candidate) => candidate.id === categoryId) ?? categories[0];

	const choose = (keys: string[], on: boolean) =>
		setSelected((current) => {
			const next = new Set(current);
			keys.forEach((key) => (on ? next.add(key) : next.delete(key)));
			return next;
		});

	const plan = (planned: RowChange[]) => {
		if (planned.length === 0) return;
		if (lowers(planned).length > 0) setPending(planned);
		else applyChanges(planned);
	};

	const runBulk = (action: ToolbarAction, rows: MassRow[]) => {
		const resolved: BulkAction =
			action.kind === "hall"
				? { kind: "hall", categories: homeCategories(draft, action.hall) }
				: action;
		plan(planBulk(draft, rows, resolved));
	};

	const setRow = (row: MassRow, level: number) =>
		edit((current, now) => writeRow(current, row.ref, level, now));

	const progress = categoryProgress(draft, category);

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, townHall)} />
			<ScopeNav village={village} homeCount={changes.length} />
			<CategoryPicker
				label={text.category.nav}
				activeId={category.id}
				onChange={(id) => {
					setSelected(new Set());
					setCategoryId(id);
				}}
				options={categories.map((entry) => {
					const entryProgress = categoryProgress(draft, entry);
					return {
						id: entry.id,
						label: entry.label,
						locked: entry.requirement !== undefined,
						count: entry.requirement
							? undefined
							: `${entryProgress.done} / ${entryProgress.total}`,
					};
				})}
			/>
			<Card className="flex flex-col gap-4 p-4">
				{category.requirement ? (
					<EmptyState
						title={category.label}
						description={text.category.locked(category.requirement)}
					/>
				) : category.isWalls ? (
					<WallsPanel
						category={category}
						draft={draft}
						saved={village}
						onChange={setRow}
						onPlan={plan}
					/>
				) : category.rows.length === 0 ? (
					<p className="text-muted">{text.category.empty}</p>
				) : (
					<>
						<p className="text-muted">
							{text.category.atMax(progress.done, progress.total, townHall)}
						</p>
						<BulkToolbar
							categoryLabel={category.label}
							rows={category.rows}
							selected={selected}
							townHall={townHall}
							onSelectAll={(on) =>
								choose(
									category.rows.map((row) => row.key),
									on
								)
							}
							onClearSelection={() => setSelected(new Set())}
							onAction={runBulk}
						/>
						<RowList
							rows={category.rows}
							draft={draft}
							saved={village}
							selected={selected}
							onSelect={choose}
							onChange={setRow}
						/>
					</>
				)}
			</Card>
			<ActionBar count={changes.length} onDiscard={discard} onSave={save} />
			<BulkConfirmDialog
				changes={pending}
				onClose={() => setPending(null)}
				onConfirm={() => {
					if (pending) applyChanges(pending);
					setPending(null);
				}}
			/>
		</>
	);
};

export const MassEditPage = () => (
	<VillageGate title={text.title}>
		{(village) => <MassEditView key={village.id} village={village} />}
	</VillageGate>
);
