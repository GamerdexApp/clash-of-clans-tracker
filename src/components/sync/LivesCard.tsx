"use client";

import { DATA_FILE, META_FILE } from "@gamerdexapp/gamerdex-sync";

import { useSync } from "@/lib/contexts/SyncContext";
import { formatNumber } from "@/lib/format";
import { syncText } from "@/lib/messages/sync";
import { SYNC_APP_ID } from "@/lib/sync/device";
import { dataFolderOf } from "@/lib/sync/providerFactory";
import { usesRepository } from "@/lib/sync/providers";
import { Card } from "@/comps/ui/Card";

const text = syncText;

const Row = ({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) => (
	<>
		<dt className="text-muted">{label}</dt>
		<dd className={`text-end break-words ${mono ? "font-mono text-xs" : ""}`}>
			{value.split("/").map((part, index) => (
				<span key={index}>
					{index > 0 && <wbr />}
					{index > 0 && "/"}
					{part}
				</span>
			))}
		</dd>
	</>
);

export const LivesCard = () => {
	const { provider, repository, cloudCopy } = useSync();
	if (!provider) return null;
	const kilobytes = cloudCopy ? Math.max(1, Math.round(JSON.stringify(cloudCopy, null, 2).length / 1024)) : null;

	return (
		<Card className="flex flex-col gap-3 p-4">
			<h2 className="text-base font-semibold">{text.lives.title}</h2>
			<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
				<Row label={text.lives.storage} value={text.provider[provider].name} mono={false} />
				{usesRepository(provider) && repository && <Row label={text.connected.repository} value={repository} />}
				<Row label={text.lives.folder} value={dataFolderOf(provider, SYNC_APP_ID)} />
				<Row label={text.lives.dataFile} value={DATA_FILE} />
				{kilobytes !== null && <Row label={text.lives.size} value={text.lives.kb(formatNumber(kilobytes))} mono={false} />}
				<Row label={text.lives.metaFile} value={META_FILE} />
			</dl>
			<p className="text-muted">{text.lives.note}</p>
			<p className="text-muted">{text.lives.notes[provider]}</p>
		</Card>
	);
};
