"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useMassEditDraft } from "@/lib/hooks/useMassEditDraft";
import { useUrlTab } from "@/lib/hooks/useUrlTab";
import { massEditText } from "@/lib/messages/massEdit";
import {
  builderCategories,
  categoryProgress,
  homeCategories,
  lowers,
  planBuilderHallLowering,
  planBulk,
  setBuilderHall,
  writeRow,
  type BulkAction,
  type MassCategory,
  type MassRow,
  type MassScope,
  type RowChange,
} from "@/service/massEdit";
import { clanCapitalState, lockedRequirement } from "@/service/navAccess";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { Badge } from "@/comps/ui/Badge";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import type { Playthrough } from "@/types/app";
import { ActionBar } from "./ActionBar";
import { BuilderProfileCard } from "./BuilderProfileCard";
import { BulkConfirmDialog } from "./BulkConfirmDialog";
import { BulkToolbar, type ToolbarAction } from "./BulkToolbar";
import { CategoryPicker } from "./CategoryPicker";
import { RowList } from "./RowList";
import { WallsPanel } from "./WallsPanel";

const text = massEditText;

type EditableScope = Extract<MassScope, "home" | "builder">;

/** The requirement a scope misses, or null when it is open. Clan Capital keeps its own page until Mass edit takes it over. */
const scopeRequirement = (scope: MassScope, village: Playthrough): string | null => {
	if (scope === "home") return null;
	if (scope === "builder") return lockedRequirement("builderBaseUpgrades", village);
	const capital = clanCapitalState(village);
	return capital === "locked" ? lockedRequirement("districts", village) : capital === "off" ? text.trackingOff : null;
};

interface ScopeNavProps {
	village: Playthrough;
	scope: EditableScope;
	counts: Record<EditableScope, number>;
	onScope: (scope: EditableScope) => void;
}

const scopeClasses = "flex min-h-11 items-center gap-2 rounded-md border-[1.5px] px-4 font-medium lg:min-h-9";

const ScopeNav = ({ village, scope, counts, onScope }: ScopeNavProps) => (
	<nav aria-label={text.scopeNav} className="flex flex-wrap gap-2">
		{(["home", "builder"] as const).map((id) => {
			const requirement = scopeRequirement(id, village);
			if (requirement) return <LockedScope key={id} scope={id} requirement={requirement} />;
			return (
				<button
					key={id}
					type="button"
					aria-current={scope === id ? "page" : undefined}
					onClick={() => onScope(id)}
					className={`${scopeClasses} ${scope === id ? "border-primary bg-tint" : "border-line bg-surface hover:bg-tint"}`}
				>
					{text.scopes[id]}
					{counts[id] > 0 && <Badge tone="changed">{text.changedCount(counts[id])}</Badge>}
				</button>
			);
		})}
		{scopeRequirement("capital", village) ? (
			<LockedScope scope="capital" requirement={scopeRequirement("capital", village)!} />
		) : (
			<Link href="/mass-edit/capital" className={`${scopeClasses} border-line bg-surface hover:bg-tint`}>
				{text.scopes.capital}
			</Link>
		)}
	</nav>
);

const LockedScope = ({ scope, requirement }: { scope: MassScope; requirement: string }) => (
	<span className="border-line text-muted bg-tint flex min-h-11 flex-col justify-center rounded-md border-[1.5px] border-dashed px-4 leading-tight lg:min-h-9">
		<span className="font-medium">{text.scopes[scope]}</span>
		<span className="text-xs">{requirement === text.trackingOff ? requirement : text.requires(requirement)}</span>
	</span>
);

interface PendingConfirm {
	changes: RowChange[];
	apply: () => void;
}

const MassEditView = ({ village }: { village: Playthrough }) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { draft, categories, changes, countFor, edit, applyChanges, discard, save } = useMassEditDraft(village);
	const requestedScope = searchParams.get("scope");
	const scope: EditableScope = requestedScope === "builder" && !scopeRequirement("builder", village) ? "builder" : "home";
	const scopeCategories = categories[scope];
	const ids = scopeCategories.map((category) => category.id);
	const [categoryId, setCategoryId] = useUrlTab(ids, ids[0]);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [pending, setPending] = useState<PendingConfirm | null>(null);
	const category: MassCategory = scopeCategories.find((candidate) => candidate.id === categoryId) ?? scopeCategories[0];

	const townHall = village.data.homeVillage.townHallLevel;
	const builderHall = draft.data.builderBase.builderHallLevel;
	const hall = scope === "home" ? { name: text.hallNames.home, level: townHall } : { name: text.hallNames.builder, level: builderHall };

	const changeScope = (next: EditableScope) => {
		setSelected(new Set());
		router.replace(`${pathname}?scope=${next}`, { scroll: false });
	};

	const choose = (keys: string[], on: boolean) =>
		setSelected((current) => {
			const next = new Set(current);
			keys.forEach((key) => (on ? next.add(key) : next.delete(key)));
			return next;
		});

	const plan = (planned: RowChange[]) => {
		if (planned.length === 0) return;
		if (lowers(planned).length > 0) setPending({ changes: planned, apply: () => applyChanges(planned) });
		else applyChanges(planned);
	};

	const runBulk = (action: ToolbarAction, rows: MassRow[]) => {
		const resolved: BulkAction =
			action.kind === "hall"
				? { kind: "hall", categories: scope === "home" ? homeCategories(draft, action.hall) : builderCategories(draft, action.hall) }
				: action;
		plan(planBulk(draft, rows, resolved));
	};

	const setRow = (row: MassRow, level: number) => edit((current, now) => writeRow(current, row.ref, level, now));

	const changeBuilderHall = (level: number) => {
		const lowered = level < builderHall ? planBuilderHallLowering(draft, level) : [];
		const apply = () => edit((current, now) => setBuilderHall(current, level, lowered, now));
		if (lowered.length > 0) setPending({ changes: lowered, apply });
		else apply();
	};

	const progress = categoryProgress(draft, category);

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, townHall)} />
			<ScopeNav village={village} scope={scope} counts={{ home: countFor("home"), builder: countFor("builder") }} onScope={changeScope} />
			{scope === "builder" && (
				<BuilderProfileCard
					draft={draft}
					onHall={changeBuilderHall}
					onTrophies={(value) => setRow(profileRow("trophies"), value)}
					onBestTrophies={(value) => setRow(profileRow("bestTrophies"), value)}
					onLeague={(index) => setRow(profileRow("league"), index)}
				/>
			)}
			<CategoryPicker
				label={text.category.nav}
				activeId={category.id}
				onChange={(id) => {
					setSelected(new Set());
					setCategoryId(id);
				}}
				options={scopeCategories.map((entry) => {
					const entryProgress = categoryProgress(draft, entry);
					return {
						id: entry.id,
						label: entry.label,
						locked: entry.requirement !== undefined,
						count: entry.requirement ? undefined : `${entryProgress.done} / ${entryProgress.total}`,
					};
				})}
			/>
			<Card className="flex flex-col gap-4 p-4">
				{category.requirement ? (
					<EmptyState title={category.label} description={text.category.locked(category.requirement)} />
				) : scope === "builder" && builderHall === 0 ? (
					<p className="text-muted">{text.builder.none}</p>
				) : category.isWalls ? (
					<WallsPanel category={category} draft={draft} saved={village} onChange={setRow} onPlan={plan} />
				) : category.rows.length === 0 ? (
					<p className="text-muted">{text.category.empty}</p>
				) : (
					<>
						<p className="text-muted">{text.category.atMax(progress.done, progress.total, hall.name, hall.level)}</p>
						<BulkToolbar
							categoryLabel={category.label}
							rows={category.rows}
							selected={selected}
							hall={hall}
							onSelectAll={(on) =>
								choose(
									category.rows.map((row) => row.key),
									on,
								)
							}
							onClearSelection={() => setSelected(new Set())}
							onAction={runBulk}
						/>
						<RowList rows={category.rows} draft={draft} saved={village} selected={selected} onSelect={choose} onChange={setRow} />
					</>
				)}
			</Card>
			<ActionBar count={changes.length} onDiscard={discard} onSave={save} />
			<BulkConfirmDialog
				changes={pending?.changes ?? null}
				onClose={() => setPending(null)}
				onConfirm={() => {
					pending?.apply();
					setPending(null);
				}}
			/>
		</>
	);
};

const profileRow = (field: "trophies" | "bestTrophies" | "league"): MassRow => ({
	key: field,
	ref: { kind: "profile", field },
	label: field,
	imageUrl: "",
	max: 0,
});

export const MassEditPage = () => (
	<VillageGate title={text.title}>{(village) => <MassEditView key={village.id} village={village} />}</VillageGate>
);
