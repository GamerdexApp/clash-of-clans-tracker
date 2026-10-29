"use client";

import Image from "next/image";

import { massEditText } from "@/lib/messages/massEdit";
import { readRow, rowMax, type MassRow } from "@/service/massEdit";
import { Checkbox } from "@/comps/ui/Checkbox";
import { NumberStepper } from "@/comps/ui/NumberStepper";
import type { Playthrough } from "@/types/app";

const text = massEditText.rows;

interface MassRowViewProps {
	row: MassRow;
	draft: Playthrough;
	saved: Playthrough;
	selected: boolean;
	onSelect: (selected: boolean) => void;
	onChange: (row: MassRow, level: number) => void;
	/** The row of a Supercharge tier sits under its building and is never selected. */
	indent?: boolean;
	disabledReason?: string;
}

const RowImage = ({ url }: { url: string }) =>
	url ? (
		<Image src={url} alt="" width={36} height={36} style={{ width: 36, height: 36 }} className="shrink-0 object-contain" />
	) : (
		<span className="size-9 shrink-0" />
	);

/** One level row: select box, image, name, slider, stepper, the maximum and what changed. */
export const MassRowView = ({ row, draft, saved, selected, onSelect, onChange, indent = false, disabledReason }: MassRowViewProps) => {
	const level = readRow(draft, row.ref);
	const before = readRow(saved, row.ref);
	const max = rowMax(draft, row);
	const blocked = row.blocked ?? disabledReason;
	const disabled = blocked !== undefined || max === 0;
	const changed = level !== before;

	return (
		<div
			className={`flex flex-wrap items-center gap-x-3 gap-y-2 border-s-4 py-2 ps-2 ${indent ? "ms-8" : ""} ${
				changed ? "bg-tint border-primary" : "border-transparent"
			}`}
		>
			{!indent && <Checkbox hideLabel label={text.select(row.label)} checked={selected} onChange={onSelect} />}
			<RowImage url={row.imageUrl} />
			<div className="flex min-w-32 flex-1 flex-col leading-tight">
				<span className="font-medium">{row.label}</span>
				<span className="text-muted text-xs">
					{blocked ??
						(changed ? text.changed(before, level) : level === 0 ? text.notBuilt : level >= max ? text.atMax : text.toMax(max - level))}
				</span>
			</div>
			<input
				type="range"
				aria-label={text.slider(row.label)}
				min={0}
				max={max}
				step={1}
				value={Math.min(level, max)}
				disabled={disabled}
				onChange={(event) => onChange(row, Number(event.target.value))}
				className="accent-primary h-8 w-32 grow basis-32 sm:max-w-56"
			/>
			<NumberStepper
				value={level}
				min={0}
				max={max}
				step={1}
				label={text.level(row.label)}
				raiseLabel={text.raise(row.label)}
				lowerLabel={text.lower(row.label)}
				onChange={(next) => !disabled && onChange(row, next)}
			/>
			<span className="text-muted font-mono text-sm whitespace-nowrap">/ {max}</span>
			<button
				type="button"
				disabled={disabled || level >= max}
				onClick={() => onChange(row, max)}
				className="border-line bg-surface hover:bg-tint min-h-9 rounded-full border-[1.5px] px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
			>
				{text.max}
			</button>
		</div>
	);
};
