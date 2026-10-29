"use client";

import React, { createContext, useContext, useState, useSyncExternalStore } from "react";

import { useIsHydrated } from "@/lib/hooks/useIsHydrated";
import * as appData from "@/service/appData";
import { defaultSettings } from "@/service/migrate";
import { storageService } from "@/service/storage";
import type { PlaythroughContextType } from "@/types/contexts";

const PlaythroughContext = createContext<PlaythroughContextType | undefined>(undefined);

export const PlaythroughProvider = ({ children }: { children: React.ReactNode }) => {
	const data = useSyncExternalStore(
		storageService.subscribe,
		storageService.load,
		storageService.loadOnServer
	);
	const isLoaded = useIsHydrated();
	const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
	const [saveFailed, setSaveFailed] = useState(false);

	const updateData: PlaythroughContextType["updateData"] = (update) => {
		const previous = storageService.load();
		const saved = storageService.save(update(previous));

		setSaveFailed(!saved);
		if (saved) setLastSavedAt(new Date());
		return saved ? previous : null;
	};

	const activePlaythrough =
		data.playthroughs.find((p) => p.id === data.activePlaythroughId) ?? null;

	const importData: PlaythroughContextType["importData"] = (jsonString) => {
		try {
			const parsed = JSON.parse(jsonString);
			if (!Array.isArray(parsed?.playthroughs)) {
				return { success: false, error: "Invalid data format: missing playthroughs array" };
			}
			return storageService.save(parsed)
				? { success: true }
				: { success: false, error: "The data could not be saved" };
		} catch (error) {
			return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
		}
	};

	return (
		<PlaythroughContext.Provider
			value={{
				appData: data,
				playthroughs: data.playthroughs,
				activePlaythrough,
				isLoaded,
				lastSavedAt,
				saveFailed,
				appSettings: data.settings ?? defaultSettings,
				updateData,
				setActivePlaythrough: (id) => {
					updateData((current) => appData.setActivePlaythrough(current, id));
				},
				addPlaythrough: (input) => {
					updateData((current) => appData.addPlaythrough(current, input));
				},
				updatePlaythrough: (id, updates) => {
					updateData((current) => appData.updatePlaythrough(current, id, updates));
				},
				deletePlaythrough: (id) => {
					updateData((current) => appData.deletePlaythrough(current, id));
				},
				updateSettings: (patch) => {
					updateData((current) => appData.updateSettings(current, patch));
				},
				importData,
				exportData: () => JSON.stringify(storageService.load(), null, 2),
				clearAllData: () => storageService.clear(),
			}}
		>
			{children}
		</PlaythroughContext.Provider>
	);
};

export const usePlaythrough = () => {
	const context = useContext(PlaythroughContext);
	if (context === undefined) {
		throw new Error("usePlaythrough must be used within a PlaythroughProvider");
	}
	return context;
};
