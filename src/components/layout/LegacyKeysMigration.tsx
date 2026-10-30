"use client";

import { useEffect } from "react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { hasLegacyKeys, LEGACY_KEYS, uiFromLegacyKeys } from "@/lib/services/legacyKeys";

/** Moves the old per-page Hide Max flags and hidden categories into `settings.ui` once, then deletes the old keys. */
export const LegacyKeysMigration = () => {
	const { appSettings, isLoaded, updateSettings } = usePlaythrough();

	useEffect(() => {
		if (!isLoaded || !hasLegacyKeys(localStorage)) return;
		updateSettings({ ui: uiFromLegacyKeys(localStorage, appSettings.ui) });
		LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
	}, [isLoaded, appSettings.ui, updateSettings]);

	return null;
};
