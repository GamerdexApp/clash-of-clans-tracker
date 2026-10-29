"use client";

import { formatNumber } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import type { LevelOption } from "@/service/helpers";

const text = dailiesText.helpers;

interface LevelPickerProps {
	label: string;
	levels: LevelOption[];
	townHall: number;
	value: number | undefined;
	onChange: (level: number | undefined) => void;
}

const pillClasses = (selected: boolean, available: boolean) =>
	`flex min-h-11 min-w-11 flex-col items-center justify-center rounded-md border-[1.5px] px-3 leading-tight lg:min-h-10 ${
		selected ? "border-primary bg-tint" : "border-line bg-surface"
	} ${available ? "cursor-pointer hover:bg-tint" : "text-muted cursor-not-allowed opacity-60"}`;

/** Pills for every level. A level above the Town Hall is disabled and says which Town Hall it needs. */
export const LevelPicker = ({ label, levels, townHall, value, onChange }: LevelPickerProps) => {
	const next = levels.find((option) => option.level === (value ?? 0) + 1);
	return (
		<div className="flex flex-col gap-2">
			<div role="group" aria-label={label} className="flex flex-wrap gap-2">
				<button type="button" aria-pressed={value === undefined} onClick={() => onChange(undefined)} className={pillClasses(value === undefined, true)}>
					<span className="font-medium">{text.none}</span>
				</button>
				{levels.map((option) => {
					const available = townHall >= option.townHallRequired;
					return (
						<button
							key={option.level}
							type="button"
							aria-pressed={value === option.level}
							disabled={!available}
							onClick={() => onChange(option.level)}
							aria-label={`${text.levelOption(option.level)}, ${available ? text.levelTownHall(option.townHallRequired) : text.levelRequires(option.townHallRequired)}`}
							className={pillClasses(value === option.level, available)}
						>
							<span className="font-mono font-medium">{option.level}</span>
							<span className="text-muted text-[11px]">{text.levelTownHall(option.townHallRequired)}</span>
						</button>
					);
				})}
			</div>
			{next && <p className="text-muted text-sm">{text.nextLevel(next.level, formatNumber(next.gemCost))}</p>}
		</div>
	);
};
