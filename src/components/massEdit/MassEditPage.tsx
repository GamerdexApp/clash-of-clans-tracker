"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Playthrough } from "@/types/app";
import type { ZoneId } from "@/types/app/capital";
import { useMassEditDraft } from "@/lib/hooks/useMassEditDraft";
import { useUrlTab } from "@/lib/hooks/useUrlTab";
import { massEditText } from "@/lib/messages/massEdit";
import {
	capitalHallOf,
	changeCapitalHall,
	changeZoneHall,
	type HallChange,
	zoneHall,
} from "@/service/capital";
import {
	builderCategories,
	type BulkAction,
	capitalCategories,
	categoryProgress,
	hallOfCategory,
	homeCategories,
	lowers,
	type MassCategory,
	type MassRow,
	type MassScope,
	planBuilderHallLowering,
	planBulk,
	type RowChange,
	setBuilderHall,
	writeRow,
} from "@/service/massEdit";
import { clanCapitalState, lockedRequirement } from "@/service/navAccess";
import { HallChangeDialog } from "@/comps/capital/HallChangeDialog";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { Badge } from "@/comps/ui/Badge";
import { ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { ActionBar } from "./ActionBar";
import { BuilderProfileCard } from "./BuilderProfileCard";
import { BulkConfirmDialog } from "./BulkConfirmDialog";
import { BulkToolbar, type ToolbarAction } from "./BulkToolbar";
import { CapitalProfileCard } from "./CapitalProfileCard";
import { CategoryPicker } from "./CategoryPicker";
import { RowList } from "./RowList";
import { WallsPanel } from "./WallsPanel";
import { ZoneHallPicker } from "./ZoneHallPicker";

const text = massEditText;

/** The requirement a scope misses, or null when it can open. A Clan Capital scope with tracking off opens and explains itself. */
const scopeRequirement = (scope: MassScope, village: Playthrough): string | null => {
	if (scope === "home") return null;
	if (scope === "builder") return lockedRequirement("builderBaseUpgrades", village);
	return clanCapitalState(village) === "locked" ? lockedRequirement("districts", village) : null;
};

interface ScopeNavProps {
	village: Playthrough;
	scope: MassScope;
	counts: Record<MassScope, number>;
	onScope: (scope: MassScope) => void;
}

const scopeClasses =
	"flex min-h-11 items-center gap-2 rounded-md border-[1.5px] px-4 font-medium lg:min-h-9";

const ScopeNav = ({ village, scope, counts, onScope }: ScopeNavProps) => (
	<nav aria-label={text.scopeNav} className="flex flex-wrap gap-2">
		{(["home", "builder", "capital"] as const).map((id) => {
			const requirement = scopeRequirement(id, village);
			if (requirement) return <LockedScope key={id} scope={id} requirement={requirement} />;
			const off = id === "capital" && clanCapitalState(village) === "off";
			return (
				<button
					key={id}
					type="button"
					aria-current={scope === id ? "page" : undefined}
					onClick={() => onScope(id)}
					className={`${scopeClasses} ${scope === id ? "border-primary bg-tint" : "border-line bg-surface hover:bg-tint"}`}
				>
					{text.scopes[id]}
					{off && <span className="text-muted text-xs">{text.trackingOff}</span>}
					{counts[id] > 0 && (
						<Badge tone="changed">{text.changedCount(counts[id])}</Badge>
					)}
				</button>
			);
		})}
	</nav>
);

const LockedScope = ({ scope, requirement }: { scope: MassScope; requirement: string }) => (
	<span className="border-line text-muted bg-tint flex min-h-11 flex-col justify-center rounded-md border-[1.5px] border-dashed px-4 leading-tight lg:min-h-9">
		<span className="font-medium">{text.scopes[scope]}</span>
		<span className="text-xs">
			{requirement === text.trackingOff ? requirement : text.requires(requirement)}
		</span>
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
	const { draft, categories, changes, countFor, edit, applyChanges, discard, save } =
		useMassEditDraft(village);
	const requestedScope = searchParams.get("scope");
	const scope: MassScope =
		(requestedScope === "builder" || requestedScope === "capital") &&
		!scopeRequirement(requestedScope, village)
			? requestedScope
			: "home";
	const scopeCategories = categories[scope];
	const ids = scopeCategories.map((category) => category.id);
	const [categoryId, setCategoryId] = useUrlTab(ids, ids[0]);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [pending, setPending] = useState<PendingConfirm | null>(null);
	const [hallPending, setHallPending] = useState<{
		change: HallChange;
		apply: () => void;
	} | null>(null);
	const [partIds, setPartIds] = useState<Record<string, string>>({});
	const category: MassCategory =
		scopeCategories.find((candidate) => candidate.id === categoryId) ?? scopeCategories[0];

	const townHall = village.data.homeVillage.townHallLevel;
	const builderHall = draft.data.builderBase.builderHallLevel;
	const capitalHall = capitalHallOf(draft);
	const zoneHallInfo = hallOfCategory(draft, category);
	const hall =
		scope === "home"
			? { name: text.hallNames.home, level: townHall }
			: scope === "builder"
				? { name: text.hallNames.builder, level: builderHall }
				: zoneHallInfo
					? {
							name:
								zoneHallInfo.zone === "capitalPeak"
									? text.hallNames.capital
									: text.hallNames.district,
							level: zoneHallInfo.level,
						}
					: undefined;
	const parts = category.parts ?? [];
	const part = parts.find((candidate) => candidate.id === partIds[category.id]) ?? parts[0];
	const shown = part ?? category;
	const capitalOff = scope === "capital" && clanCapitalState(village) === "off";

	const changeScope = (next: MassScope) => {
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
		if (lowers(planned).length > 0)
			setPending({ changes: planned, apply: () => applyChanges(planned) });
		else applyChanges(planned);
	};

	const runBulk = (action: ToolbarAction, rows: MassRow[]) => {
		const resolved: BulkAction =
			action.kind === "hall"
				? {
						kind: "hall",
						categories:
							scope === "home"
								? homeCategories(draft, action.hall)
								: scope === "builder"
									? builderCategories(draft, action.hall)
									: capitalCategories(draft, {
											zone: category.zone as ZoneId,
											hall: action.hall,
										}),
					}
				: action;
		plan(planBulk(draft, rows, resolved));
	};

	const setRow = (row: MassRow, level: number) =>
		edit((current, now) => writeRow(current, row.ref, level, now));

	const changeBuilderHall = (level: number) => {
		const lowered = level < builderHall ? planBuilderHallLowering(draft, level) : [];
		const apply = () => edit((current, now) => setBuilderHall(current, level, lowered, now));
		if (lowered.length > 0) setPending({ changes: lowered, apply });
		else apply();
	};

	const changeZone = (zone: ZoneId, level: number) => {
		const change =
			zone === "capitalPeak"
				? changeCapitalHall(draft, level)
				: changeZoneHall(draft, zone, level);
		const apply = () =>
			edit(
				(current) =>
					(zone === "capitalPeak"
						? changeCapitalHall(current, level)
						: changeZoneHall(current, zone, level)
					).village
			);
		if (change.resets.length > 0) setHallPending({ change, apply });
		else apply();
	};

	const progress = categoryProgress(draft, shown);

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, townHall)} />
			<ScopeNav
				village={village}
				scope={scope}
				counts={{
					home: countFor("home"),
					builder: countFor("builder"),
					capital: countFor("capital"),
				}}
				onScope={changeScope}
			/>
			{scope === "builder" && (
				<BuilderProfileCard
					draft={draft}
					onHall={changeBuilderHall}
					onTrophies={(value) => setRow(profileRow("trophies"), value)}
					onBestTrophies={(value) => setRow(profileRow("bestTrophies"), value)}
					onLeague={(index) => setRow(profileRow("league"), index)}
				/>
			)}
			{scope === "capital" && !capitalOff && (
				<CapitalProfileCard
					draft={draft}
					onCapitalHall={(level) => changeZone("capitalPeak", level)}
					onContributions={(amount) => setRow(profileRow("contributions"), amount)}
				/>
			)}
			{capitalOff ? (
				<EmptyState
					title={text.capital.off}
					description={text.capital.offBody}
					actions={
						<ButtonLink href="/clan-capital/districts">
							{text.capital.offAction}
						</ButtonLink>
					}
				/>
			) : (
				<>
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
								count: entry.requirement
									? undefined
									: `${entryProgress.done} / ${entryProgress.total}`,
							};
						})}
					/>
					<Card className="flex flex-col gap-4 p-4">
						{category.zone &&
							category.zone !== "capitalPeak" &&
							!category.requirement && (
								<ZoneHallPicker
									draft={draft}
									zone={category.zone}
									capitalHall={capitalHall}
									onChange={(level) => changeZone(category.zone as ZoneId, level)}
								/>
							)}
						{parts.length > 1 && (
							<CategoryPicker
								label={text.capital.parts}
								activeId={shown.id}
								onChange={(id) => {
									setSelected(new Set());
									setPartIds((current) => ({ ...current, [category.id]: id }));
								}}
								options={parts.map((entry) => {
									const entryProgress = categoryProgress(draft, entry);
									return {
										id: entry.id,
										label: entry.label,
										count: `${entryProgress.done} / ${entryProgress.total}`,
									};
								})}
							/>
						)}
						{category.requirement ? (
							<EmptyState
								title={category.label}
								description={text.category.locked(category.requirement)}
							/>
						) : scope === "builder" && builderHall === 0 ? (
							<p className="text-muted">{text.builder.none}</p>
						) : shown.isWalls ? (
							<WallsPanel
								category={shown}
								draft={draft}
								saved={village}
								onChange={setRow}
								onPlan={plan}
							/>
						) : shown.rows.length === 0 ? (
							<p className="text-muted">
								{category.zone && category.zone !== "capitalPeak"
									? text.capital.unlockHint(text.hallNames.district)
									: text.category.empty}
							</p>
						) : (
							<>
								<p className="text-muted">
									{hall
										? text.category.atMax(
												progress.done,
												progress.total,
												hall.name,
												hall.level
											)
										: text.category.rowsAtMax(progress.done, progress.total)}
								</p>
								<BulkToolbar
									categoryLabel={shown.label}
									rows={shown.rows}
									selected={selected}
									hall={hall}
									onSelectAll={(on) =>
										choose(
											shown.rows.map((row) => row.key),
											on
										)
									}
									onClearSelection={() => setSelected(new Set())}
									onAction={runBulk}
								/>
								<RowList
									rows={shown.rows}
									draft={draft}
									saved={village}
									selected={selected}
									onSelect={choose}
									onChange={setRow}
								/>
							</>
						)}
					</Card>
				</>
			)}
			<ActionBar count={changes.length} onDiscard={discard} onSave={save} />
			<HallChangeDialog
				change={hallPending?.change ?? null}
				onClose={() => setHallPending(null)}
				onConfirm={() => {
					hallPending?.apply();
					setHallPending(null);
				}}
			/>
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

const profileRow = (field: "trophies" | "bestTrophies" | "league" | "contributions"): MassRow => ({
	key: field,
	ref: { kind: "profile", field },
	label: field,
	imageUrl: "",
	max: 0,
});

export const MassEditPage = () => (
	<VillageGate title={text.title}>
		{(village) => <MassEditView key={village.id} village={village} />}
	</VillageGate>
);
