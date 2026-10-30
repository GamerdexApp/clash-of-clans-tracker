"use client";

import type { Conflict } from "@gamerdexapp/gamerdex-sync";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useSync } from "@/lib/contexts/SyncContext";
import { syncText } from "@/lib/messages/sync";
import { SettingsCard } from "@/comps/settings/SettingsCard";
import { Button } from "@/comps/ui/Button";

const text = syncText.conflicts;

const valueText = (value: unknown) => (value === undefined ? null : typeof value === "string" ? value : JSON.stringify(value));

const ConflictRow = ({ conflict }: { conflict: Conflict }) => {
	const { playthroughs } = usePlaythrough();
	const { keepLocalValue } = useSync();
	const [section, villageId, ...rest] = conflict.path;
	const village = section === "playthroughs" ? playthroughs.find((other) => other.id === villageId) : null;
	const fields = (village ? rest : [villageId, ...rest]).filter((step) => step && step !== "data");
	const where = [village?.name ?? section, ...fields].join(" / ");

	return (
		<li className="border-line flex flex-col gap-2 border-t pt-3 first:border-t-0 first:pt-0">
			<p className="font-mono">{where}</p>
			{conflict.kind === "delete-edit" && <p className="text-muted">{text.deletedEdited}</p>}
			<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
				<dt className="text-muted">{text.cloudValue}</dt>
				<dd className="font-mono break-all">{valueText(conflict.remote) ?? text.empty}</dd>
				<dt className="text-muted">{text.deviceValue}</dt>
				<dd className="font-mono break-all">{valueText(conflict.local) ?? text.empty}</dd>
			</dl>
			<div>
				<Button onClick={() => keepLocalValue(conflict)}>{text.keepDevice}</Button>
			</div>
		</li>
	);
};

export const ConflictsCard = () => {
	const { conflicts, dismissConflicts } = useSync();
	if (conflicts.length === 0) return null;
	return (
		<SettingsCard
			title={text.title}
			description={text.body}
			aside={
				<Button variant="ghost" onClick={dismissConflicts}>
					{text.dismiss}
				</Button>
			}
		>
			<ul className="flex flex-col gap-3">
				{conflicts.map((conflict, index) => (
					<ConflictRow key={`${conflict.path.join("/")}-${index}`} conflict={conflict} />
				))}
			</ul>
		</SettingsCard>
	);
};
