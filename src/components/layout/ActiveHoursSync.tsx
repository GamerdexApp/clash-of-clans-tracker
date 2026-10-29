"use client";

import { useEffect } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { settingsText } from "@/lib/messages/settings";
import { formatClockTime, isSameWindow, utcWindowFor } from "@/service/activeHours";
import { useToast } from "@/comps/ui/Toast";

/** Keeps the shared UTC window in step with the local window after a clock change. */
export const ActiveHoursSync = () => {
	const { appSettings, isLoaded, updateSettings } = usePlaythrough();
	const showToast = useToast();
	const local = appSettings.activeHoursLocal;
	const stored = appSettings.activeHours;

	useEffect(() => {
		if (!isLoaded || !local) return;
		const derived = utcWindowFor(local);
		if (isSameWindow(stored, derived)) return;

		updateSettings({ activeHours: derived });
		showToast({
			variant: "info",
			title: settingsText.activeHours.clockChanged(formatClockTime(local.start), formatClockTime(local.end)),
		});
	}, [isLoaded, local, stored, updateSettings, showToast]);

	return null;
};
