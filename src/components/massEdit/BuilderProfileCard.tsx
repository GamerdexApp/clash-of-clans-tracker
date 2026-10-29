"use client";

import { massEditText } from "@/lib/messages/massEdit";
import { builderLeagues } from "@/service/builderBaseProfile";
import { Card } from "@/comps/ui/Card";
import { CommitNumberInput } from "@/comps/ui/CommitNumberInput";
import { Field } from "@/comps/ui/Field";
import { NumberStepper } from "@/comps/ui/NumberStepper";
import { Select } from "@/comps/ui/Select";
import type { Playthrough } from "@/types/app";

const text = massEditText.builder;
const MAX_BUILDER_HALL = 10;

interface BuilderProfileCardProps {
	draft: Playthrough;
	onHall: (level: number) => void;
	onTrophies: (value: number) => void;
	onBestTrophies: (value: number) => void;
	onLeague: (index: number) => void;
}

/** The Builder Hall and profile fields of the scope. They sit in the draft like every row. */
export const BuilderProfileCard = ({ draft, onHall, onTrophies, onBestTrophies, onLeague }: BuilderProfileCardProps) => {
	const base = draft.data.builderBase;
	const leagues = builderLeagues();
	return (
		<Card className="flex flex-col gap-4 p-4">
			<h2 className="text-lg font-semibold">{text.profile}</h2>
			<div className="flex flex-wrap items-end gap-4">
				<Field label={text.hall}>
					<NumberStepper
						value={base.builderHallLevel}
						min={0}
						max={MAX_BUILDER_HALL}
						step={1}
						label={text.hall}
						raiseLabel={text.raise}
						lowerLabel={text.lower}
						onChange={onHall}
					/>
				</Field>
				<Field label={text.trophies}>
					<CommitNumberInput aria-label={text.trophies} value={base.builderBaseTrophies} onCommit={onTrophies} className="w-32 font-mono" />
				</Field>
				<Field label={text.bestTrophies}>
					<CommitNumberInput aria-label={text.bestTrophies} value={base.bestBuilderBaseTrophies} onCommit={onBestTrophies} className="w-32 font-mono" />
				</Field>
				<Field label={text.league}>
					<Select
						value={leagues.findIndex((league) => league.storedName === base.builderBaseLeagueName)}
						onChange={(event) => onLeague(Number(event.target.value))}
					>
						{leagues.map((league, index) => (
							<option key={league.storedName} value={index}>
								{league.storedName}
							</option>
						))}
					</Select>
				</Field>
			</div>
			<p className="text-muted">{text.hallHelp(base.builderHallLevel)}</p>
		</Card>
	);
};
