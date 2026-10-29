"use client";

import { useState } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { settingsText } from "@/lib/messages/settings";
import { activeHoursProblem, formatClockTime, utcWindowFor } from "@/service/activeHours";
import { utcMinutesToLocalTimeStr } from "@/lib/utils/activeHoursHelpers";
import { Button } from "@/comps/ui/Button";
import { Field } from "@/comps/ui/Field";
import { Input } from "@/comps/ui/Input";
import { Note } from "@/comps/ui/Note";
import type { ActiveHoursLocal } from "@/types/app/playthrough";
import { SettingsCard } from "./SettingsCard";

const text = settingsText.activeHours;
const DEFAULT_WINDOW: ActiveHoursLocal = { start: "07:00", end: "23:00" };

const savedWindow = (settings: ReturnType<typeof usePlaythrough>["appSettings"]): ActiveHoursLocal | null => {
	if (settings.activeHoursLocal) return settings.activeHoursLocal;
	if (!settings.activeHours) return null;
	return {
		start: utcMinutesToLocalTimeStr(settings.activeHours.startUtcMinutes),
		end: utcMinutesToLocalTimeStr(settings.activeHours.endUtcMinutes),
	};
};

export const ActiveHoursCard = () => {
	const { appSettings, updateSettings } = usePlaythrough();
	const saved = savedWindow(appSettings);
	const [draft, setDraft] = useState<ActiveHoursLocal>(saved ?? DEFAULT_WINDOW);

	const problem = activeHoursProblem(draft);
	const hasUnsavedChanges = saved === null || saved.start !== draft.start || saved.end !== draft.end;

	const save = () => {
		updateSettings({ activeHoursLocal: draft, activeHours: utcWindowFor(draft) });
	};
	const clear = () => {
		updateSettings({ activeHoursLocal: undefined, activeHours: undefined });
		setDraft(DEFAULT_WINDOW);
	};

	return (
		<SettingsCard title={text.title} description={text.description}>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label={text.start}>
					<Input
						type="time"
						value={draft.start}
						onChange={(event) => setDraft({ ...draft, start: event.target.value })}
					/>
				</Field>
				<Field label={text.end}>
					<Input
						type="time"
						value={draft.end}
						onChange={(event) => setDraft({ ...draft, end: event.target.value })}
					/>
				</Field>
			</div>
			{problem === "sameTime" && <Note tone="warning">{text.sameTime}</Note>}
			{problem === "overnight" && (
				<Note>{text.overnight(formatClockTime(draft.start), formatClockTime(draft.end))}</Note>
			)}
			<p className="text-muted">
				{saved ? text.status(formatClockTime(saved.start), formatClockTime(saved.end)) : text.none}
				{saved && hasUnsavedChanges && ` ${text.unsaved}`}
			</p>
			<div className="flex flex-wrap gap-2">
				<Button
					variant="primary"
					disabled={problem === "sameTime" || !hasUnsavedChanges}
					onClick={save}
				>
					{text.save}
				</Button>
				{saved && <Button onClick={clear}>{text.clear}</Button>}
			</div>
		</SettingsCard>
	);
};
