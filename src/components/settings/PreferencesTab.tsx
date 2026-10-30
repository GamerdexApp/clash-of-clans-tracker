"use client";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { settingsText } from "@/lib/messages/settings";
import { RadioGroup } from "@/comps/ui/RadioGroup";
import { SwitchRow } from "@/comps/ui/Switch";
import type { ThemeChoice } from "@/types/app";
import { ActiveHoursCard } from "./ActiveHoursCard";
import { RegionCard } from "./RegionCard";
import { SettingsCard } from "./SettingsCard";

const text = settingsText;
const THEMES: ThemeChoice[] = ["light", "dark", "system"];
const THEME_OPTIONS = THEMES.map((id) => ({ id, label: text.appearance.themes[id] }));

const Appearance = () => {
	const { appSettings, updateSettings } = usePlaythrough();
	const systemIsDark = useMediaQuery("(prefers-color-scheme: dark)");

	return (
		<SettingsCard title={text.appearance.title} description={text.appearance.description}>
			<RadioGroup
				label={text.appearance.themeLabel}
				options={THEME_OPTIONS}
				value={appSettings.theme ?? "system"}
				onChange={(theme) => updateSettings({ theme })}
			/>
			<p className="text-muted">{text.appearance.themeNote(systemIsDark ? "dark" : "light")}</p>
		</SettingsCard>
	);
};

const BuilderSettings = () => {
	const { appSettings, updateSettings } = usePlaythrough();

	return (
		<SettingsCard title={text.builders.title} description={text.builders.description}>
			<SwitchRow
				label={text.builders.goblinBuilder}
				description={text.builders.goblinBuilderHelp}
				checked={appSettings.goblinBuilderEnabled}
				onChange={(goblinBuilderEnabled) => updateSettings({ goblinBuilderEnabled })}
			/>
			<SwitchRow
				label={text.builders.goblinResearch}
				description={text.builders.goblinResearchHelp}
				checked={appSettings.goblinResearchEnabled}
				onChange={(goblinResearchEnabled) => updateSettings({ goblinResearchEnabled })}
			/>
		</SettingsCard>
	);
};

export const PreferencesTab = () => (
	<div className="grid items-start gap-4 lg:grid-cols-2">
		<div className="flex flex-col gap-4">
			<BuilderSettings />
			<ActiveHoursCard />
		</div>
		<div className="flex flex-col gap-4">
			<Appearance />
			<RegionCard />
		</div>
	</div>
);
