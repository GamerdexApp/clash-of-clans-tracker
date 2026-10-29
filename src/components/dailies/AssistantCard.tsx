"use client";

import { formatDuration } from "@/lib/format";
import { useDailiesActions } from "@/lib/hooks/useDailiesActions";
import { dailiesText } from "@/lib/messages/dailies";
import { dailiesOf } from "@/service/dailies";
import type { AssigningHelper } from "@/service/helperAssignments";
import { helperLevel, levelOptions, workPerUseMs } from "@/service/helpers";
import type { Playthrough } from "@/types/app";
import { AssignmentPanel } from "./AssignmentPanel";
import { DailyTimer } from "./DailyTimer";
import { HelperShell } from "./HelperShell";
import { LevelPicker } from "./LevelPicker";

const text = dailiesText.helpers;

interface AssistantCardProps {
	village: Playthrough;
	helper: AssigningHelper;
	now: Date;
}

/** The Builder's Apprentice and the Lab Assistant: a level, a daily use and one assigned upgrade. */
export const AssistantCard = ({ village, helper, now }: AssistantCardProps) => {
	const actions = useDailiesActions(village);
	const townHall = village.data.homeVillage.townHallLevel;
	const name = text.names[helper];
	const level = helperLevel(village, helper);

	return (
		<HelperShell helper={helper} townHall={townHall}>
			<section className="flex flex-col gap-2">
				<h3 className="font-semibold">{text.dailyUse}</h3>
				<DailyTimer
					timer={dailiesOf(village).helpers[helper]}
					now={now}
					name={name}
					onSetTime={(time) => actions.setResetTime(helper, time)}
					onSetTimeAndUse={(time) => actions.setResetTimeAndUse(helper, time, name)}
					onUse={() => actions.markHelperUsed(helper)}
				/>
			</section>
			<section className="flex flex-col gap-2">
				<h3 className="font-semibold">{text.level}</h3>
				<LevelPicker
					label={`${name} ${text.level}`}
					levels={levelOptions(helper)}
					townHall={townHall}
					value={level}
					onChange={(next) => actions.setHelperLevel(helper, next)}
				/>
				<p className="text-muted">{level ? text.saves(formatDuration(workPerUseMs(village, helper))) : text.noLevel}</p>
			</section>
			<AssignmentPanel village={village} helper={helper} now={now} />
		</HelperShell>
	);
};
