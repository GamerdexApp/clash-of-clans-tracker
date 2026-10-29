"use client";

import { useBuilderBaseActions } from "@/lib/hooks/useBuilderBaseActions";
import { builderBaseProfileText } from "@/lib/messages/builderBase";
import {
	builderLeagues,
	matchLeagueToTrophies,
	setBestTrophies,
	setBuilderHallSince,
	setLeague,
	setTrophies,
} from "@/service/builderBaseProfile";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { CommitNumberInput } from "@/comps/ui/CommitNumberInput";
import { Field } from "@/comps/ui/Field";
import { Input } from "@/comps/ui/Input";
import { Select } from "@/comps/ui/Select";
import type { Playthrough } from "@/types/app";

const text = builderBaseProfileText;

const dateInputValue = (iso: string | undefined) => (iso ? iso.slice(0, 10) : "");
const todayLocal = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/** What the old app only showed: trophies, best trophies, league and the Builder Hall date. Every field saves as it is edited. */
export const BuilderBaseProfileCard = ({ village }: { village: Playthrough }) => {
	const { update } = useBuilderBaseActions(village);
	const bb = village.data.builderBase;
	const leagues = builderLeagues();
	const savedLeagueIsListed = leagues.some((league) => league.storedName === bb.builderBaseLeagueName);

	return (
		<Card className="flex flex-col gap-4 p-4">
			<h2 className="text-base font-semibold">{text.title}</h2>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Field label={text.trophies}>
					<CommitNumberInput
						value={bb.builderBaseTrophies}
						aria-label={text.trophies}
						onCommit={(value) => update((current) => setTrophies(current, value))}
					/>
				</Field>
				<Field label={text.bestTrophies} hint={text.bestHint}>
					<CommitNumberInput
						value={bb.bestBuilderBaseTrophies}
						aria-label={text.bestTrophies}
						onCommit={(value) => update((current) => setBestTrophies(current, value))}
					/>
				</Field>
				<Field label={text.league}>
					<Select
						value={bb.builderBaseLeagueName}
						onChange={(event) => update((current) => setLeague(current, event.target.value))}
					>
						<option value="">{text.leagueNone}</option>
						{!savedLeagueIsListed && bb.builderBaseLeagueName && (
							<option value={bb.builderBaseLeagueName}>{bb.builderBaseLeagueName}</option>
						)}
						{leagues.map((league) => (
							<option key={league.storedName} value={league.storedName}>
								{league.storedName}
							</option>
						))}
					</Select>
				</Field>
				<Field label={text.since}>
					<Input
						type="date"
						value={dateInputValue(village.bhChangedAt)}
						onChange={(event) => update((current) => setBuilderHallSince(current, event.target.value || null))}
					/>
				</Field>
			</div>
			<div className="flex flex-wrap gap-2">
				<Button onClick={() => update(matchLeagueToTrophies)}>{text.matchTrophies}</Button>
				<Button onClick={() => update((current) => setBuilderHallSince(current, todayLocal()))}>{text.sinceToday}</Button>
			</div>
		</Card>
	);
};
