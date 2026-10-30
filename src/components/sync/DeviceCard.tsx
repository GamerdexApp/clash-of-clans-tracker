"use client";

import { useState } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useSync } from "@/lib/contexts/SyncContext";
import { syncText } from "@/lib/messages/sync";
import { Card } from "@/comps/ui/Card";
import { Field } from "@/comps/ui/Field";
import { Input } from "@/comps/ui/Input";

const text = syncText.device;

export const DeviceCard = () => {
	const { activePlaythrough } = usePlaythrough();
	const { deviceName, setDeviceName } = useSync();
	const [draft, setDraft] = useState<string | null>(null);

	const commit = () => {
		if (draft !== null) setDeviceName(draft);
		setDraft(null);
	};

	return (
		<Card className="flex flex-col gap-4 p-4">
			<h2 className="text-base font-semibold">{text.title}</h2>
			<Field label={text.name} hint={text.nameHint}>
				<Input
					value={draft ?? deviceName}
					maxLength={60}
					onChange={(event) => setDraft(event.target.value)}
					onBlur={commit}
					onKeyDown={(event) => {
						if (event.key === "Enter") event.currentTarget.blur();
					}}
				/>
			</Field>
			<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
				<dt className="text-muted">{text.activeVillage}</dt>
				<dd className="text-end">{activePlaythrough?.name ?? text.noVillage}</dd>
				<dt className="text-muted">{text.login}</dt>
				<dd className="text-end">{text.loginValue}</dd>
			</dl>
			<p className="text-muted">{text.loginHint}</p>
		</Card>
	);
};
