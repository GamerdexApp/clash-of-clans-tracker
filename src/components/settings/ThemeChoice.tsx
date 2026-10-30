"use client";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { settingsText } from "@/lib/messages/settings";
import { SegmentedControl } from "@/comps/ui/SegmentedControl";
import type { ThemeChoice as ThemeOption } from "@/types/app";

const text = settingsText.appearance;

const themeOptions = (): { id: ThemeOption; label: string }[] => [
	{ id: "light", label: text.themes.light },
	{ id: "dark", label: text.themes.dark },
	{ id: "system", label: text.themes.system },
];

export const ThemeChoice = () => {
	const { appSettings, updateSettings } = usePlaythrough();

	return (
		<SegmentedControl
			label={text.themeLabel}
			options={themeOptions()}
			value={appSettings.theme ?? "system"}
			onChange={(theme) => updateSettings({ theme })}
		/>
	);
};
