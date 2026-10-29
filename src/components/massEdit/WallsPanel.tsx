"use client";

import Image from "next/image";

import { massEditText } from "@/lib/messages/massEdit";
import { readRow, rowMax, wallStats, type MassCategory, type MassRow, type RowChange } from "@/service/massEdit";
import { Button } from "@/comps/ui/Button";
import { NumberStepper } from "@/comps/ui/NumberStepper";
import { SummaryTile } from "@/comps/ui/SummaryTile";
import type { Playthrough } from "@/types/app";

const text = massEditText.walls;
const rowText = massEditText.rows;

interface WallsPanelProps {
	category: MassCategory;
	draft: Playthrough;
	saved: Playthrough;
	onChange: (row: MassRow, count: number) => void;
	onPlan: (changes: RowChange[]) => void;
}

/** Wall counts per level. A count stops at the walls still to place, so the total is never passed. */
export const WallsPanel = ({ category, draft, saved, onChange, onPlan }: WallsPanelProps) => {
	const { total, placed } = wallStats(draft, category);
	const top = category.rows[category.rows.length - 1];

	const maxAll = () => {
		if (!top) return;
		const from = readRow(draft, top.ref);
		onPlan([{ row: top, from, to: from + Math.max(0, total - placed) }].filter((change) => change.to !== change.from));
	};

	const resetAll = () =>
		onPlan(category.rows.flatMap((row) => (readRow(draft, row.ref) > 0 ? [{ row, from: readRow(draft, row.ref), to: 0 }] : [])));

	return (
		<div className="flex flex-col gap-4">
			<div className="grid gap-3 sm:grid-cols-3">
				<SummaryTile label={text.total} value={total} />
				<SummaryTile label={text.allocated} value={placed} />
				<SummaryTile label={text.remaining} value={Math.max(0, total - placed)} emphasis />
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<Button variant="primary" onClick={maxAll}>
					{text.maxAll}
				</Button>
				<Button variant="danger" onClick={resetAll}>
					{text.resetAll}
				</Button>
				<span className="text-muted text-sm">{text.maxAllHelp}</span>
			</div>
			<div className="flex flex-col">
				{category.rows.map((row) => {
					const count = readRow(draft, row.ref);
					const before = readRow(saved, row.ref);
					const max = rowMax(draft, row);
					const changed = count !== before;
					return (
						<div
							key={row.key}
							className={`flex flex-wrap items-center gap-x-3 gap-y-2 border-s-4 py-2 ps-2 ${changed ? "bg-tint border-primary" : "border-transparent"}`}
						>
							{row.imageUrl && (
								<Image src={row.imageUrl} alt="" width={36} height={36} style={{ width: 36, height: 36 }} className="shrink-0 object-contain" />
							)}
							<div className="flex min-w-24 flex-1 flex-col leading-tight">
								<span className="font-medium">{row.label}</span>
								{changed && <span className="text-muted text-xs">{rowText.changed(before, count)}</span>}
							</div>
							<input
								type="range"
								aria-label={rowText.slider(text.level(row.ref.kind === "wall" ? row.ref.level : 0))}
								min={0}
								max={max}
								value={Math.min(count, max)}
								disabled={max === 0}
								onChange={(event) => onChange(row, Number(event.target.value))}
								className="accent-primary h-8 w-32 grow basis-32 sm:max-w-56"
							/>
							<NumberStepper
								value={count}
								min={0}
								max={max}
								step={1}
								label={rowText.level(row.label)}
								raiseLabel={rowText.raise(row.label)}
								lowerLabel={rowText.lower(row.label)}
								onChange={(next) => onChange(row, next)}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};
