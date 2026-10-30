"use client";

import Link from "next/link";

import { useOptionalSync } from "@/lib/contexts/SyncContext";
import { syncText } from "@/lib/messages/sync";
import { SYNC_HREF } from "@/data/nav";

/** The words for the state of sync, or null while sync is off or not signed in. */
export const useSyncLabel = (): string | null => {
	const sync = useOptionalSync();
	if (!sync?.available || sync.status === "signedOut") return null;
	return sync.conflicts.length > 0 ? syncText.status.conflicts : syncText.status[sync.status];
};

export const SyncChip = () => {
	const sync = useOptionalSync();
	const label = useSyncLabel();
	if (sync === null || label === null) return null;

	const dot =
		sync.conflicts.length > 0 ? "bg-warn" : sync.status === "idle" ? "bg-kept" : sync.status === "syncing" ? "bg-primary" : "bg-warn";

	return (
		<Link
			href={SYNC_HREF}
			className="border-line bg-surface text-muted hover:bg-tint inline-flex h-8 items-center gap-2 rounded-full border-[1.5px] px-3 text-xs"
		>
			<span aria-hidden="true" className={`${dot} size-1.5 rounded-full`} />
			{label}
		</Link>
	);
};
