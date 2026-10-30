"use client";

import { useId } from "react";
import { type SyncSettingKey, useSync } from "@/lib/contexts/SyncContext";
import { syncText } from "@/lib/messages/sync";
import { Card } from "@/comps/ui/Card";
import { Switch } from "@/comps/ui/Switch";

const text = syncText.settings;

const rows = () =>
	[
		{ setting: "autoSync", label: text.auto, hint: text.autoHint },
		{ setting: "syncOnReturn", label: text.focus, hint: text.focusHint },
		{ setting: "waitOnMetered", label: text.metered, hint: text.meteredHint },
	] as const satisfies readonly { setting: SyncSettingKey; label: string; hint: string }[];

const SettingRow = ({ setting, label, hint }: ReturnType<typeof rows>[number]) => {
	const { settings, setSyncSetting } = useSync();
	const base = useId();
	return (
		<div className="flex items-start justify-between gap-4">
			<div className="flex flex-col gap-0.5">
				<span id={`${base}-label`} className="font-semibold">
					{label}
				</span>
				<span id={`${base}-hint`} className="text-muted">
					{hint}
				</span>
			</div>
			<Switch
				checked={settings[setting]}
				onChange={(checked) => setSyncSetting(setting, checked)}
				labelledBy={`${base}-label`}
				describedBy={`${base}-hint`}
			/>
		</div>
	);
};

export const SyncSettingsCard = () => (
	<Card className="flex flex-col gap-4 p-4">
		<h2 className="text-base font-semibold">{text.title}</h2>
		{rows().map((row) => (
			<SettingRow key={row.setting} {...row} />
		))}
	</Card>
);
