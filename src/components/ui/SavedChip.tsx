"use client";

import { useEffect, useState } from "react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { uiText } from "@/lib/messages/ui";

const REFRESH_MS = 30_000;
const MINUTE_MS = 60_000;

const formatTime = (date: Date) =>
	new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(date);

const formatSaved = (savedAt: Date | null, now: number) => {
	if (!savedAt) return uiText.savedChip.automatic;

	const elapsed = now - savedAt.getTime();
	if (elapsed < MINUTE_MS) return uiText.savedChip.justNow;
	if (elapsed < 60 * MINUTE_MS) {
		return uiText.savedChip.minutesAgo(Math.floor(elapsed / MINUTE_MS));
	}
	return uiText.savedChip.at(formatTime(savedAt));
};

export function useSavedLabel() {
	const { lastSavedAt, saveFailed } = usePlaythrough();
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), REFRESH_MS);
		return () => clearInterval(timer);
	}, []);

	if (saveFailed) return uiText.savedChip.failed;
	return formatSaved(lastSavedAt, Math.max(now, lastSavedAt?.getTime() ?? 0));
}

export function SavedChip() {
	const label = useSavedLabel();

	return (
		<span
			role="status"
			className="border-line bg-surface text-muted inline-flex h-8 items-center gap-2 rounded-full border-[1.5px] px-3 text-xs"
		>
			<span aria-hidden="true" className="bg-kept size-1.5 rounded-full" />
			{label}
		</span>
	);
}
