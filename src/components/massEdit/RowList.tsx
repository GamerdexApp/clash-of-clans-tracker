"use client";

import Image from "next/image";
import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

import { massEditText } from "@/lib/messages/massEdit";
import { readRow, type MassRow } from "@/service/massEdit";
import { Checkbox } from "@/comps/ui/Checkbox";
import type { Playthrough } from "@/types/app";
import { MassRowView } from "./MassRowView";

const text = massEditText.rows;

interface RowListProps {
	rows: MassRow[];
	draft: Playthrough;
	saved: Playthrough;
	selected: Set<string>;
	onSelect: (keys: string[], selected: boolean) => void;
	onChange: (row: MassRow, level: number) => void;
}

/** Rows of one building or hero sit together even when the data lists them apart. */
const groupsOf = (rows: MassRow[]) => {
	const groups = new Map<string, MassRow[]>();
	for (const row of rows) {
		const name = row.group ?? row.label;
		groups.set(name, [...(groups.get(name) ?? []), row]);
	}
	return [...groups].map(([name, members]) => ({ name, rows: members }));
};

const sectionsOf = (rows: MassRow[]) => {
	const sections: { name: string | undefined; rows: MassRow[] }[] = [];
	for (const row of rows) {
		const last = sections[sections.length - 1];
		if (last && last.name === row.section) last.rows.push(row);
		else sections.push({ name: row.section, rows: [row] });
	}
	return sections;
};

interface GroupProps extends Omit<RowListProps, "rows"> {
	name: string;
	rows: MassRow[];
}

const Group = ({ name, rows, draft, saved, selected, onSelect, onChange }: GroupProps) => {
	const [collapsed, setCollapsed] = useState(false);
	const levels = rows.map((row) => readRow(draft, row.ref));
	const keys = rows.map((row) => row.key);
	const allSelected = keys.every((key) => selected.has(key));

	const renderRow = (row: MassRow) => {
		const level = readRow(draft, row.ref);
		const supercharge = row.supercharge;
		return (
			<div key={row.key}>
				<MassRowView
					row={row}
					draft={draft}
					saved={saved}
					selected={selected.has(row.key)}
					onSelect={(next) => onSelect([row.key], next)}
					onChange={onChange}
				/>
				{supercharge && (
					<MassRowView
						row={supercharge.row}
						draft={draft}
						saved={saved}
						selected={false}
						onSelect={() => {}}
						onChange={onChange}
						indent
						disabledReason={level >= supercharge.requiredLevel ? undefined : text.reachFirst(supercharge.requiredLevel)}
					/>
				)}
			</div>
		);
	};

	if (rows.length === 1 && rows[0].group === undefined) return renderRow(rows[0]);
	if (rows.length === 1 && rows[0].label === name) return renderRow(rows[0]);

	return (
		<div className="border-line flex flex-col rounded-md border-[1.5px]">
			<div className="bg-tint flex flex-wrap items-center gap-3 px-3 py-1">
				<Checkbox hideLabel label={text.selectGroup(name)} checked={allSelected} onChange={(next) => onSelect(keys, next)} />
				{rows[0].imageUrl && (
					<Image src={rows[0].imageUrl} alt="" width={28} height={28} style={{ width: 28, height: 28 }} className="object-contain" />
				)}
				<button
					type="button"
					aria-expanded={!collapsed}
					onClick={() => setCollapsed(!collapsed)}
					className="flex min-h-9 min-w-0 flex-1 items-center gap-2 text-start"
				>
					<span className="font-semibold">{name}</span>
					<span className="text-muted truncate text-xs">
						{collapsed ? levels.join(", ") : text.groupBuilt(levels.filter((level) => level > 0).length, rows[0].max)}
					</span>
					<LuChevronDown aria-hidden="true" size={16} className={`ms-auto shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
				</button>
			</div>
			{!collapsed && <div className="flex flex-col px-1">{rows.map(renderRow)}</div>}
		</div>
	);
};

/** Rows grouped by building, with a collapsible header per group and headings for sections. */
export const RowList = ({ rows, ...rest }: RowListProps) => (
	<div className="flex flex-col gap-3">
		{sectionsOf(rows).map((section) => (
			<div key={section.name ?? "all"} className="flex flex-col gap-2">
				{section.name && <h3 className="text-muted font-mono text-xs tracking-[0.08em] uppercase">{section.name}</h3>}
				{groupsOf(section.rows).map((group) => (
					<Group key={group.name} name={group.name} rows={group.rows} {...rest} />
				))}
			</div>
		))}
	</div>
);
