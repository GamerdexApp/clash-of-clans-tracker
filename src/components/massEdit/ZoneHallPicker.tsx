"use client";

import { massEditText } from "@/lib/messages/massEdit";
import { districtHallRequirement, maxDistrictHall, topDistrictHall, zoneHall } from "@/service/capital";
import { Field } from "@/comps/ui/Field";
import { Select } from "@/comps/ui/Select";
import type { Playthrough } from "@/types/app";
import type { ZoneId } from "@/types/app/capital";

const text = massEditText.capital;

interface ZoneHallPickerProps {
	draft: Playthrough;
	zone: ZoneId;
	capitalHall: number;
	onChange: (level: number) => void;
}

/** A District Hall above what the Capital Hall allows is disabled and says which Capital Hall it needs. */
export const ZoneHallPicker = ({ draft, zone, capitalHall, onChange }: ZoneHallPickerProps) => {
	const allowed = maxDistrictHall(zone, capitalHall);
	return (
		<Field label={text.districtHall}>
			<Select value={zoneHall(draft, zone)} onChange={(event) => onChange(Number(event.target.value))}>
				<option value={0}>{text.districtNone}</option>
				{Array.from({ length: topDistrictHall(zone) }, (_, index) => index + 1).map((level) => {
					const needed = districtHallRequirement(zone, level);
					return (
						<option key={level} value={level} disabled={level > allowed}>
							{level > allowed && needed !== null ? `${text.districtLevel(level)}, ${text.requiresCapitalHall(needed)}` : text.districtLevel(level)}
						</option>
					);
				})}
			</Select>
		</Field>
	);
};
