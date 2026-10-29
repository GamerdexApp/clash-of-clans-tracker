"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { formatClock } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import { nextReset, timerState } from "@/service/dailies";
import { Badge } from "@/comps/ui/Badge";
import { Button } from "@/comps/ui/Button";
import { Field } from "@/comps/ui/Field";
import { Input } from "@/comps/ui/Input";
import type { DailyTimerData } from "@/types/app/playthrough";

const text = dailiesText.timer;

const timeZoneName = () =>
	new Intl.DateTimeFormat(undefined, { timeZoneName: "long" }).formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value ?? "";

const zoneLabel = () => `${timeZoneName()} (${text.deviceClock})`;

const clockTime = (hours: number, minutes: number) =>
	new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));

const resetClockTime = (resetTime: string) => {
	const [hours, minutes] = resetTime.split(":").map(Number);
	return clockTime(hours, minutes);
};

const usedClockTime = (iso: string) => {
	const used = new Date(iso);
	return clockTime(used.getHours(), used.getMinutes());
};

interface TimeFormProps {
	label: string;
	initial: string;
	children: (time: string) => ReactNode;
}

const TimeForm = ({ label, initial, children }: TimeFormProps) => {
	const [time, setTime] = useState(initial);
	return (
		<div className="flex flex-col gap-3">
			<Field label={label}>
				<Input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="w-40 font-mono" />
			</Field>
			<div className="flex flex-wrap gap-2">{children(time)}</div>
		</div>
	);
};

interface DailyTimerProps {
	timer: DailyTimerData;
	now: Date;
	name: string;
	onSetTime: (time: string) => void;
	onSetTimeAndUse: (time: string) => void;
	onUse: () => void;
}

/** One timer for the Capital Gold daily, the Star Bonus and the four helpers. */
export const DailyTimer = ({ timer, now, name, onSetTime, onSetTimeAndUse, onUse }: DailyTimerProps) => {
	const [adjusting, setAdjusting] = useState(false);
	const state = timerState(timer, now);

	if (state === "notSet") {
		return (
			<div className="flex flex-col gap-2">
				<TimeForm label={text.timeLabel} initial="">
					{(time) => (
						<>
							<Button disabled={!time} onClick={() => onSetTime(time)}>
								{text.setTime}
							</Button>
							<Button variant="primary" disabled={!time} onClick={() => onSetTimeAndUse(time)}>
								{text.setAndUse}
							</Button>
						</>
					)}
				</TimeForm>
				<p className="text-muted text-xs">
					{text.notSetHelp} {text.savedIn(zoneLabel())}
				</p>
			</div>
		);
	}

	const resetTime = timer.resetTime!;

	if (adjusting) {
		return (
			<TimeForm label={text.adjustTitle} initial={resetTime}>
				{(time) => (
					<>
						<Button
							variant="primary"
							disabled={!time}
							onClick={() => {
								onSetTime(time);
								setAdjusting(false);
							}}
						>
							{text.save}
						</Button>
						<Button onClick={() => setAdjusting(false)}>{text.cancel}</Button>
					</>
				)}
			</TimeForm>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{state === "available" ? (
				<>
					<div className="flex flex-wrap items-center gap-3">
						<Badge tone="kept">{text.available}</Badge>
						<Button variant="primary" aria-label={`${text.use} ${name}`} onClick={onUse}>
							{text.use}
						</Button>
						<Button aria-label={`${text.adjust} ${name}`} onClick={() => setAdjusting(true)}>
							{text.adjust}
						</Button>
					</div>
					<p className="text-muted text-sm">{text.resetsAt(resetClockTime(resetTime), zoneLabel())}</p>
				</>
			) : (
				<>
					<div className="flex flex-wrap items-center gap-3">
						<span className="font-mono text-xl" role="timer" aria-label={`${name} countdown`}>
							{formatClock(nextReset(resetTime, now).getTime() - now.getTime())}
						</span>
						<Button aria-label={`${text.adjust} ${name}`} onClick={() => setAdjusting(true)}>
							{text.adjust}
						</Button>
					</div>
					<p className="text-muted text-sm">
						{text.untilReset(resetClockTime(resetTime), zoneLabel())}
						{timer.lastCollectedAt && ` ${text.usedAt(usedClockTime(timer.lastCollectedAt))}`}
					</p>
				</>
			)}
		</div>
	);
};
