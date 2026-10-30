"use client";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useSync } from "@/lib/contexts/SyncContext";
import { formatDateTime, formatNumber } from "@/lib/format";
import { syncText } from "@/lib/messages/sync";
import { fromSyncShape } from "@/lib/sync/shape";
import { Badge } from "@/comps/ui/Badge";
import { Button } from "@/comps/ui/Button";
import type { Playthrough } from "@/types/app";

const text = syncText.villages;

const tones = { synced: "kept", changedHere: "changed", conflict: "warn", newHere: "changed" } as const;

type VillageStatus = keyof typeof tones;

const statusOf = (village: Playthrough, cloud: Playthrough | undefined, hasConflict: boolean): VillageStatus => {
	if (hasConflict) return "conflict";
	if (!cloud) return "newHere";
	return JSON.stringify(village) === JSON.stringify(cloud) ? "synced" : "changedHere";
};

const Describe = ({ village }: { village: Playthrough }) => (
	<>
		<span>{text.describe(formatNumber(village.data.homeVillage.townHallLevel))}</span>
		<span className="text-muted font-mono text-xs">{formatDateTime(village.lastModified)}</span>
	</>
);

export const VillagesList = ({ onReview }: { onReview: () => void }) => {
	const { playthroughs } = usePlaythrough();
	const { cloudCopy, conflicts } = useSync();
	const cloudVillages = cloudCopy ? fromSyncShape(cloudCopy).playthroughs : [];

	return (
		<div className="flex flex-col gap-3">
			<h3 className="text-base font-semibold">{text.title}</h3>
			<ul className="flex flex-col gap-3">
				{playthroughs.map((village) => {
					const cloud = cloudVillages.find((other) => other.id === village.id);
					const hasConflict = conflicts.some((conflict) => conflict.path[0] === "playthroughs" && conflict.path[1] === village.id);
					const current = statusOf(village, cloud, hasConflict);
					return (
						<li key={village.id} className="border-line bg-surface flex flex-col gap-2 rounded-md border-[1.5px] p-3">
							<div className="flex items-start justify-between gap-3">
								<span className="font-semibold">{village.name}</span>
								<Badge tone={tones[current]}>{text.status[current]}</Badge>
							</div>
							<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
								<dt className="text-muted">{text.thisDevice}</dt>
								<dd className="flex flex-col items-end text-end">
									<Describe village={village} />
								</dd>
								<dt className="text-muted">{text.cloud}</dt>
								<dd className="flex flex-col items-end text-end">
									{cloud ? <Describe village={cloud} /> : <span className="text-muted">{text.notInCloud}</span>}
								</dd>
							</dl>
							{current === "conflict" && (
								<div>
									<Button variant="link" onClick={onReview}>
										{text.review}
									</Button>
								</div>
							)}
						</li>
					);
				})}
			</ul>
			<p className="text-muted">{text.note}</p>
		</div>
	);
};
