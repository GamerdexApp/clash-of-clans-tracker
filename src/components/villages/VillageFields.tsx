"use client";

import { villagesText } from "@/lib/messages/villages";
import { Field } from "@/comps/ui/Field";
import { Input } from "@/comps/ui/Input";
import { Select } from "@/comps/ui/Select";
import { SwitchRow } from "@/comps/ui/Switch";
import { Textarea } from "@/comps/ui/Textarea";
import type { VillageFieldsProps } from "@/types/components/villages";

const text = villagesText.fields;
const TOWN_HALL_LEVELS = Array.from({ length: 18 }, (_, index) => index + 1);
const BUILDER_HALL_LEVELS = Array.from({ length: 10 }, (_, index) => index + 1);
const CLAN_CAPITAL_TOWN_HALL = 3;

export const VillageFields = ({
	values,
	onChange,
	showNameError,
	townHallLevel,
	levels,
	notice,
}: VillageFieldsProps) => {
	const capitalLocked = townHallLevel < CLAN_CAPITAL_TOWN_HALL;

	return (
		<>
			<Field label={text.name} error={showNameError ? text.nameRequired : undefined}>
				<Input
					data-autofocus
					value={values.name}
					placeholder={text.namePlaceholder}
					onChange={(event) => onChange({ name: event.target.value })}
				/>
			</Field>
			{notice}
			{levels && (
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label={text.townHallLevel}>
						<Select
							value={levels.townHall}
							onChange={(event) =>
								levels.onChange(Number(event.target.value), levels.builderHall)
							}
						>
							{TOWN_HALL_LEVELS.map((level) => (
								<option key={level} value={level}>
									{text.level(level)}
								</option>
							))}
						</Select>
					</Field>
					<Field label={text.builderHallLevel} hint={text.builderHallHelp}>
						<Select
							value={levels.builderHall}
							onChange={(event) =>
								levels.onChange(levels.townHall, Number(event.target.value))
							}
						>
							{BUILDER_HALL_LEVELS.map((level) => (
								<option key={level} value={level}>
									{text.level(level)}
								</option>
							))}
						</Select>
					</Field>
				</div>
			)}
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label={text.townHallUpgraded} optional>
					<Input
						type="date"
						value={values.townHallChangedAt}
						onChange={(event) => onChange({ townHallChangedAt: event.target.value })}
					/>
				</Field>
				<Field label={text.builderHallUpgraded} optional>
					<Input
						type="date"
						value={values.builderHallChangedAt}
						onChange={(event) => onChange({ builderHallChangedAt: event.target.value })}
					/>
				</Field>
			</div>
			<SwitchRow
				label={text.trackCapital}
				description={capitalLocked ? text.trackCapitalLocked : text.trackCapitalHelp}
				checked={values.trackCapital && !capitalLocked}
				disabled={capitalLocked}
				onChange={(trackCapital) => onChange({ trackCapital })}
			/>
			<Field label={text.description} optional>
				<Textarea
					value={values.description}
					placeholder={text.descriptionPlaceholder}
					rows={2}
					onChange={(event) => onChange({ description: event.target.value })}
				/>
			</Field>
		</>
	);
};
