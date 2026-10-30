"use client";

import { ROOT_FOLDER } from "@gamerdexapp/gamerdex-sync";
import { useState } from "react";
import type { ReactNode } from "react";

import { type SyncErrorKind, useSync } from "@/lib/contexts/SyncContext";
import { formatDateTime, formatNumber } from "@/lib/format";
import { syncText } from "@/lib/messages/sync";
import { type SyncProviderId, usesRepository } from "@/lib/sync/providers";
import { ActivityCard } from "@/comps/sync/ActivityCard";
import { ConflictsCard } from "@/comps/sync/ConflictsCard";
import { ConnectPanel } from "@/comps/sync/ConnectPanel";
import { DeviceCard } from "@/comps/sync/DeviceCard";
import { DisconnectCard } from "@/comps/sync/DisconnectCard";
import { FirstSyncDialog } from "@/comps/sync/FirstSyncDialog";
import { HowSyncWorks } from "@/comps/sync/HowSyncWorks";
import { LivesCard } from "@/comps/sync/LivesCard";
import { ProviderIcon } from "@/comps/sync/ProviderIcon";
import { ProviderTiles } from "@/comps/sync/ProviderTiles";
import { RepositoryPicker } from "@/comps/sync/RepositoryPicker";
import { SyncSettingsCard } from "@/comps/sync/SyncSettingsCard";
import { VillagesList } from "@/comps/sync/VillagesList";
import { Badge } from "@/comps/ui/Badge";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Note } from "@/comps/ui/Note";
import { SettingsCard } from "./SettingsCard";

const text = syncText;

const Layout = ({ main, side }: { main: ReactNode; side: ReactNode }) => (
	<div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
		<div className="flex min-w-0 flex-col gap-4">{main}</div>
		<div className="flex min-w-0 flex-col gap-4">{side}</div>
	</div>
);

const SignedOutView = () => {
	const sync = useSync();
	const [selected, setSelected] = useState<SyncProviderId>(sync.providers.includes("google") ? "google" : "github");

	return (
		<Layout
			main={
				<Card className="flex flex-col gap-4 p-4">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-lg font-semibold">{text.connect.title}</h2>
						<span className="border-line bg-surface text-muted inline-flex h-8 items-center gap-2 rounded-full border-[1.5px] px-3 text-xs">
							<span aria-hidden="true" className="bg-muted size-1.5 rounded-full" />
							{text.connect.pill}
						</span>
					</div>
					<p className="text-muted">{text.connect.intro}</p>
					<ProviderTiles providers={sync.providers} selected={selected} onSelect={setSelected} />
					<ConnectPanel provider={selected} pickAnother={sync.providers.length > 1} onConnect={() => sync.signIn(selected)} />
				</Card>
			}
			side={<HowSyncWorks />}
		/>
	);
};

const NeedsRepositoryView = () => {
	const sync = useSync();
	return (
		<Layout
			main={
				<>
					<RepositoryPicker />
					<div>
						<Button variant="ghost" onClick={sync.signOut}>
							{text.connected.signOut}
						</Button>
					</div>
				</>
			}
			side={<HowSyncWorks />}
		/>
	);
};

interface FailureNoteProps {
	kind: SyncErrorKind | "reauth";
	httpStatus: number | null;
	providerName: string;
	inRepository: boolean;
}

const FailureNote = ({ kind, httpStatus, providerName, inRepository }: FailureNoteProps) => {
	const copy = text.error;
	const messages: Record<SyncErrorKind | "reauth", string> = {
		rateLimit: copy.rateLimit,
		notFound: inRepository ? copy.notFound : copy.notFoundFolder(providerName),
		forbidden: inRepository ? copy.forbidden : copy.forbiddenFolder(providerName),
		server: copy.server,
		data: copy.data,
		busy: copy.busy,
		other: copy.other,
		reauth: copy.reauth,
	};
	const status = httpStatus === null ? null : String(httpStatus);
	return (
		<Note tone="warning">
			{messages[kind]}
			{status !== null && <span className="block">{inRepository ? copy.httpStatus(status) : copy.httpStatusFolder(providerName, status)}</span>}
		</Note>
	);
};

const ConnectedView = () => {
	const sync = useSync();
	const [dismissedFor, setDismissedFor] = useState<object | null>(null);
	const provider = sync.provider ?? "github";
	const providerName = text.provider[provider].name;
	const inRepository = usesRepository(provider);
	const failure = sync.status === "reauth" ? "reauth" : sync.errorKind;
	const conflictCount = sync.conflicts.length;
	const choiceOpen = sync.pendingChoice !== null && dismissedFor !== sync.pendingChoice;
	const review = () => document.getElementById("sync-conflicts")?.scrollIntoView({ block: "start" });

	return (
		<>
			<Layout
				main={
					<>
						<Card className="flex flex-col gap-4 p-4">
							<div className="flex items-start justify-between gap-3">
								<div className="flex min-w-0 items-center gap-3">
									<ProviderIcon provider={provider} size={22} />
									<div className="flex min-w-0 flex-col">
										<h2 className="text-lg font-semibold">{providerName}</h2>
										<span className="text-muted font-mono text-xs break-all">
											{inRepository ? sync.repository : text.connected.folder(ROOT_FOLDER)}
										</span>
									</div>
								</div>
								<Badge tone={conflictCount > 0 ? "warn" : sync.status === "idle" ? "kept" : "changed"}>
									{conflictCount > 0 ? text.status.conflicts : text.status[sync.status]}
								</Badge>
							</div>
							{failure && <FailureNote kind={failure} httpStatus={sync.errorStatus} providerName={providerName} inRepository={inRepository} />}
							{conflictCount > 0 && (
								<div className="border-primary bg-tint flex flex-col gap-2 rounded-md border-[1.5px] p-3">
									<p className="font-semibold">{text.banner.title(conflictCount, formatNumber(conflictCount))}</p>
									<p className="text-muted">{text.banner.body}</p>
									<div>
										<Button onClick={review}>{text.banner.review}</Button>
									</div>
								</div>
							)}
							{sync.pendingChoice && !choiceOpen && (
								<div className="border-primary bg-tint flex flex-col gap-2 rounded-md border-[1.5px] p-3">
									<p className="font-semibold">{text.banner.waiting}</p>
									<div>
										<Button onClick={() => setDismissedFor(null)}>{text.banner.choose}</Button>
									</div>
								</div>
							)}
							<div className="flex flex-wrap items-center justify-between gap-3">
								<span className="text-muted">
									{text.connected.lastSync}{" "}
									<span className="text-ink">{sync.lastSyncAt ? formatDateTime(sync.lastSyncAt) : text.connected.never}</span>
								</span>
								{sync.status === "reauth" ? (
									<Button variant="primary" onClick={() => sync.signIn(provider)}>
										{text.connected.signInWith(providerName)}
									</Button>
								) : (
									<Button variant="primary" disabled={sync.status === "syncing" || sync.status === "needsChoice"} onClick={() => void sync.syncNow()}>
										{text.connected.syncNow}
									</Button>
								)}
							</div>
							<VillagesList onReview={review} />
						</Card>
						{conflictCount > 0 && (
							<div id="sync-conflicts" className="scroll-mt-4">
								<ConflictsCard />
							</div>
						)}
						<ActivityCard />
					</>
				}
				side={
					<>
						<SyncSettingsCard />
						<LivesCard />
						<DeviceCard />
						<DisconnectCard />
					</>
				}
			/>
			{sync.pendingChoice && <FirstSyncDialog open={choiceOpen} choice={sync.pendingChoice} onLater={() => setDismissedFor(sync.pendingChoice)} />}
		</>
	);
};

export const SyncTab = () => {
	const sync = useSync();
	if (!sync.available) {
		return (
			<SettingsCard title={text.tab.title}>
				<Note>{text.unavailable}</Note>
			</SettingsCard>
		);
	}
	if (sync.status === "signedOut") return <SignedOutView />;
	if (sync.status === "needsRepository") return <NeedsRepositoryView />;
	return <ConnectedView />;
};
