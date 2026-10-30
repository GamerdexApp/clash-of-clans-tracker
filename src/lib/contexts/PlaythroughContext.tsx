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
				addPlaythrough: (input, options) => {
					const id = crypto.randomUUID();
					const previous = updateData((current) =>
						appData.addPlaythrough(current, input, { ...options, id })
					);
					return previous ? id : null;
				},
				updatePlaythrough: (id, updates) => {
					updateData((current) => appData.updatePlaythrough(current, id, updates));
				},
				deletePlaythrough: (id) =>
					updateData((current) => appData.deletePlaythrough(current, id)),
				updateSettings: (patch) => {
					updateData((current) => appData.updateSettings(current, patch));
				},
			}}
		>
			{children}
		</PlaythroughContext.Provider>
	);
};

export const usePlaythrough = () => {
	const context = useContext(PlaythroughContext);
	if (context === undefined) {
		throw new Error("usePlaythrough must be used within a PlaythroughProvider"); // i18n-ignore
	}
	return context;
};
