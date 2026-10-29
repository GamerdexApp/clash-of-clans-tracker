"use client";

import { useState } from "react";

import { massEditText } from "@/lib/messages/massEdit";
import type { BulkAction, MassRow } from "@/service/massEdit";
import { Button } from "@/comps/ui/Button";
import { Checkbox } from "@/comps/ui/Checkbox";
import { Field } from "@/comps/ui/Field";
import { NumberInput } from "@/comps/ui/NumberInput";
import { Select } from "@/comps/ui/Select";

const text = massEditText.toolbar;

/** The hall action carries the hall level. The page turns it into the rows of that hall. */
export type ToolbarAction = Exclude<BulkAction, { kind: "hall" }> | { kind: "hall"; hall: number };

interface BulkToolbarProps {
	categoryLabel: string;
	rows: MassRow[];
	selected: Set<string>;
	/** The hall name and level that cap the rows of this scope. */
	hall: { name: string; level: number };
	onSelectAll: (selected: boolean) => void;
	onClearSelection: () => void;
	onAction: (action: ToolbarAction, rows: MassRow[]) => void;
}

/** Bulk actions for one category. With rows selected they act on those rows, otherwise on the whole category. */
export const BulkToolbar = ({ categoryLabel, rows, selected, hall: hallInfo, onSelectAll, onClearSelection, onAction }: BulkToolbarProps) => {
	const [level, setLevel] = useState(1);
	const [hall, setHall] = useState("");
	const chosen = rows.filter((row) => selected.has(row.key));
	const target = chosen.length > 0 ? chosen : rows;
	const hasSelection = chosen.length > 0;
	const halls = Array.from({ length: hallInfo.level }, (_, index) => hallInfo.level - index);

	return (
		<div role="group" aria-label={text.label} className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<Checkbox
					label={text.selectAll(rows.length)}
					checked={rows.length > 0 && chosen.length === rows.length}
					onChange={onSelectAll}
				/>
				<span className="text-muted text-sm">
					{hasSelection ? text.scopeSelected(chosen.length) : text.scopeAll(rows.length, categoryLabel)}
				</span>
				{hasSelection && (
					<Button variant="link" onClick={onClearSelection}>
						{text.clearSelection}
					</Button>
				)}
			</div>
			<div className="flex flex-wrap items-end gap-3">
				<Button variant="primary" onClick={() => onAction({ kind: "max" }, target)}>
					{hasSelection ? text.maxSelected : text.max}
				</Button>
				<Button variant="danger" onClick={() => onAction({ kind: "reset" }, target)}>
					{hasSelection ? text.resetSelected : text.reset}
				</Button>
				<div className="flex items-end gap-2">
					<Field label={text.levelLabel}>
						<NumberInput
							aria-label={text.levelLabel}
							value={level}
							min={0}
							onChange={(next) => setLevel(next)}
							className="w-24 font-mono"
						/>
					</Field>
					<Button disabled={!hasSelection} onClick={() => onAction({ kind: "level", level }, chosen)}>
						{text.applyLevel(chosen.length)}
					</Button>
				</div>
				<Field label={text.hallLabel}>
					<Select
						value={hall}
						onChange={(event) => {
							const next = Number(event.target.value);
							setHall("");
							if (next) onAction({ kind: "hall", hall: next }, target);
						}}
					>
						<option value="">{text.hallPlaceholder(hallInfo.name)}</option>
						{halls.map((option) => (
							<option key={option} value={option}>
								{option === hallInfo.level ? text.hallCurrent(hallInfo.name, option) : text.hallOption(hallInfo.name, option)}
							</option>
						))}
					</Select>
				</Field>
			</div>
		</div>
	);
};
