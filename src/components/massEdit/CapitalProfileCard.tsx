"use client";

import { massEditText } from "@/lib/messages/massEdit";
import { capitalHallOf, maxCapitalHall } from "@/service/capital";
import { Card } from "@/comps/ui/Card";
import { CommitNumberInput } from "@/comps/ui/CommitNumberInput";
import { Field } from "@/comps/ui/Field";
import { Select } from "@/comps/ui/Select";
import type { Playthrough } from "@/types/app";

const text = massEditText.capital;

interface CapitalProfileCardProps {
	draft: Playthrough;
	onCapitalHall: (level: number) => void;
	onContributions: (amount: number) => void;
}

/** The Capital Hall and the contributions of the scope. They sit in the draft like every row. */
export const CapitalProfileCard = ({ draft, onCapitalHall, onContributions }: CapitalProfileCardProps) => (
	<Card className="flex flex-col gap-4 p-4">
		<h2 className="text-lg font-semibold">{text.profile}</h2>
		<div className="flex flex-wrap items-end gap-4">
			<Field label={text.hall}>
				<Select value={capitalHallOf(draft)} onChange={(event) => onCapitalHall(Number(event.target.value))}>
					<option value={0}>{text.none}</option>
					{Array.from({ length: maxCapitalHall }, (_, index) => index + 1).map((level) => (
						<option key={level} value={level}>
							{text.level(level)}
						</option>
					))}
				</Select>
			</Field>
			<Field label={text.contributions}>
				<span className="flex items-center gap-2">
					<CommitNumberInput
						aria-label={text.contributions}
						value={draft.data.clanCapital.clanCapitalContributions}
						onCommit={onContributions}
						className="w-40 font-mono"
					/>
					<span className="text-muted whitespace-nowrap">{text.unit}</span>
				</span>
			</Field>
		</div>
	</Card>
);
