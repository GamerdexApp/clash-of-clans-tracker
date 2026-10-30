"use client";

import type { Conflict, FirstSyncChoice, InstalledRepository } from "@gamerdexapp/gamerdex-sync";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { useIsHydrated } from "@/lib/hooks/useIsHydrated";
import { type ActivityEntry, deviceStore } from "@/lib/sync/device";
import {
	applyDocument,
	hasVillages,
	readLocalDocument,
	type SyncDocument,
} from "@/lib/sync/document";
import type { Failure } from "@/lib/sync/failure";
import type { SyncErrorKind, SyncStatus } from "@/lib/sync/types";
import {
	availableProviders,
	providerOf,
	type SyncProviderId,
	usesRepository,
} from "@/lib/sync/providers";
import { syncSchema } from "@/lib/sync/schema";
import { storageService } from "@/service/storage";

/**
 * The sync engine and the provider classes load on first use, so a visitor who never connects a
 * cloud account never loads them.
 */
const loadEngine = () => import("@/lib/sync/run");
const loadFactory = () => import("@/lib/sync/providerFactory");
const loadPackage = () => import("@gamerdexapp/gamerdex-sync");
const loadFailure = () => import("@/lib/sync/failure");

const AUTO_SYNC_DELAY_MS = 4000;
const RETURN_SYNC_GAP_MS = 30_000;

const isMeteredConnection = () =>
	(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
	true;

export type { SyncErrorKind, SyncStatus };

export interface PendingChoice {
	local: SyncDocument;
	remote: SyncDocument;
}

export type SyncSettingKey = "autoSync" | "syncOnReturn" | "waitOnMetered";

export type CallbackOutcome = "ok" | "denied" | "state" | "missing" | "failed";

interface SyncContextType {
	available: boolean;
	providers: SyncProviderId[];
	provider: SyncProviderId | null;
	status: SyncStatus;
	errorKind: SyncErrorKind | null;
	errorStatus: number | null;
	repository: string | null;
	lastSyncAt: string | null;
	conflicts: Conflict[];
	pendingChoice: PendingChoice | null;
	settings: Record<SyncSettingKey, boolean>;
	setSyncSetting: (key: SyncSettingKey, value: boolean) => void;
	deviceName: string;
	setDeviceName: (name: string) => void;
	activity: ActivityEntry[];
	cloudCopy: SyncDocument | null;
	signIn: (provider: SyncProviderId) => Promise<void>;
	installApp: () => Promise<void>;
	completeSignIn: (search: string) => Promise<CallbackOutcome>;
	listRepositories: () => Promise<InstalledRepository[]>;
	chooseRepository: (fullName: string) => void;
	syncNow: (firstSync?: FirstSyncChoice) => Promise<void>;
	keepLocalValue: (conflict: Conflict) => Promise<void>;
	dismissConflicts: () => void;
	signOut: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

/** Changes when a saved village or a setting changes, and only then. */
const playthroughsSignature = () => {
	const { playthroughs, settings } = storageService.load();
	return JSON.stringify({ playthroughs, settings });
};

const callbackUri = () => `${window.location.origin}/sync/callback`;

export function SyncProvider({ children }: { children: React.ReactNode }) {
	const appData = useSyncExternalStore(
		storageService.subscribe,
		storageService.load,
		storageService.loadOnServer
	);
	const device = useSyncExternalStore(
		deviceStore.subscribe,
		deviceStore.load,
		deviceStore.loadOnServer
	);
	const isLoaded = useIsHydrated();
	const [busy, setBusy] = useState(false);
	const [failure, setFailure] = useState<Failure | null>(null);
	const [conflicts, setConflicts] = useState<Conflict[]>([]);
	const [pendingChoice, setPendingChoice] = useState<PendingChoice | null>(null);
	const running = useRef(false);
	const rerun = useRef(false);
	const lastSynced = useRef<string | null>(null);
	const lastRun = useRef(0);

	const available = availableProviders.length > 0;
	const signedIn = device.tokens !== null;
	const provider = providerOf(device);

	const syncNow = useCallback(async (firstSync?: FirstSyncChoice) => {
		if (running.current) return;
		const current = deviceStore.load();
		if (!providerOf(current) || (providerOf(current) === "github" && !current.repository))
			return;
		running.current = true;
		lastRun.current = Date.now();
		setBusy(true);
		let choice = firstSync;
		try {
			do {
				rerun.current = false;
				const snapshot = playthroughsSignature();
				const { runSync } = await loadEngine();
				const result = await runSync(readLocalDocument(), choice);
				if (playthroughsSignature() !== snapshot) {
					rerun.current = true;
					continue;
				}
				if (result.status === "needs-choice") {
					const local = result.local as SyncDocument;
					if (!hasVillages(local)) {
						// A device with no villages has nothing to lose, so it takes the cloud copy.
						choice = "keep-cloud";
						rerun.current = true;
						continue;
					}
					setPendingChoice({ local, remote: result.remote as SyncDocument });
					continue;
				}
				const changedHere = applyDocument(result.data as SyncDocument);
				const syncedWith = providerOf(deviceStore.load());
				if (syncedWith) {
					if (result.uploaded || changedHere) {
						const kind = result.uploaded
							? changedHere
								? "merged"
								: "uploaded"
							: "downloaded";
						deviceStore.recordActivity({ kind, provider: syncedWith });
					}
					if (result.conflicts.length > 0) {
						deviceStore.recordActivity({
							kind: "conflicts",
							provider: syncedWith,
							count: result.conflicts.length,
						});
					}
				}
				lastSynced.current = playthroughsSignature();
				deviceStore.update({ state: result.state, lastSyncAt: new Date().toISOString() });
				setPendingChoice(null);
				setConflicts(result.conflicts);
				setFailure(null);
			} while (rerun.current);
		} catch (error) {
			console.warn("Sync failed", error);
			setFailure((await loadFailure()).failureOf(error));
			const failedWith = providerOf(deviceStore.load());
			if (failedWith && deviceStore.load().activity[0]?.kind !== "failed") {
				deviceStore.recordActivity({ kind: "failed", provider: failedWith });
			}
		} finally {
			running.current = false;
			setBusy(false);
		}
	}, []);

	const hasStorage =
		provider !== null && (!usesRepository(provider) || device.repository !== null);
	const signInRejected = failure?.status === "reauth";
	const ready = isLoaded && available && signedIn && hasStorage && !signInRejected;

	const automatic = device.autoSync && !(device.waitOnMetered && isMeteredConnection());
	const firstSyncPending = device.state === null;

	useEffect(() => {
		if (!ready || pendingChoice || lastSynced.current !== null) return;
		if (!automatic && !firstSyncPending) return;
		const timer = window.setTimeout(() => void syncNow(), 0);
		return () => window.clearTimeout(timer);
	}, [ready, pendingChoice, automatic, firstSyncPending, syncNow]);

	useEffect(() => {
		if (!ready || pendingChoice || !automatic) return;
		const timer = window.setTimeout(() => {
			if (lastSynced.current !== playthroughsSignature()) void syncNow();
		}, AUTO_SYNC_DELAY_MS);
		return () => window.clearTimeout(timer);
	}, [ready, appData, pendingChoice, automatic, syncNow]);

	useEffect(() => {
		if (!ready || !automatic) return;
		const onOnline = () => void syncNow();
		window.addEventListener("online", onOnline);
		return () => window.removeEventListener("online", onOnline);
	}, [ready, automatic, syncNow]);

	useEffect(() => {
		if (!ready || !automatic || !device.syncOnReturn) return;
		const onVisible = () => {
			if (document.visibilityState !== "visible") return;
			if (Date.now() - lastRun.current < RETURN_SYNC_GAP_MS) return;
			void syncNow();
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => document.removeEventListener("visibilitychange", onVisible);
	}, [ready, automatic, device.syncOnReturn, syncNow]);

	const signIn = async (chosen: SyncProviderId) => {
		const [{ newState }, { signInUrl }] = await Promise.all([loadPackage(), loadFactory()]);
		const state = newState();
		deviceStore.update({ signInState: state, provider: chosen });
		window.location.href = signInUrl(chosen, callbackUri(), state);
	};

	const installApp = async () => {
		const { installUrl, newState } = await loadPackage();
		const state = newState();
		deviceStore.update({ signInState: state });
		window.location.href = installUrl(state);
	};

	const completeSignIn = async (search: string): Promise<CallbackOutcome> => {
		const expected = deviceStore.load().signInState;
		deviceStore.update({ signInState: null });
		const { readCallback } = await loadPackage();
		const callback = readCallback(search, expected);
		if (!callback.ok) return callback.reason;
		try {
			const signedInWith = providerOf(deviceStore.load()) ?? "github";
			const { tokenSource } = await loadEngine();
			await tokenSource(signedInWith).signIn(callback.code, callbackUri());
			if (!usesRepository(signedInWith)) {
				deviceStore.recordActivity({ kind: "connected", provider: signedInWith });
			}
			setFailure(null);
			return "ok";
		} catch {
			return "failed";
		}
	};

	const listRepositories = async () => {
		const [{ listInstalledRepositories }, { tokenSource }] = await Promise.all([
			loadPackage(),
			loadEngine(),
		]);
		return listInstalledRepositories(await tokenSource("github").getToken());
	};

	const chooseRepository = (fullName: string) => {
		deviceStore.update({ repository: fullName, state: null, lastSyncAt: null });
		deviceStore.recordActivity({ kind: "connected", provider: "github" });
		setFailure(null);
		void syncNow();
	};

	const keepLocalValue = async (conflict: Conflict) => {
		const { resolveConflict } = await loadPackage();
		const next = resolveConflict(
			readLocalDocument(),
			syncSchema,
			conflict,
			"local"
		) as SyncDocument;
		applyDocument(next);
		setConflicts((current) => current.filter((other) => other !== conflict));
	};

	const signOut = () => {
		deviceStore.update({
			provider: null,
			tokens: null,
			repository: null,
			state: null,
			lastSyncAt: null,
			activity: [],
		});
		lastSynced.current = null;
		setFailure(null);
		setConflicts([]);
		setPendingChoice(null);
	};

	const setSyncSetting = (key: SyncSettingKey, value: boolean) => {
		deviceStore.update({ [key]: value });
	};

	const setDeviceName = (name: string) => {
		const trimmed = name.trim();
		if (trimmed !== "") deviceStore.update({ deviceName: trimmed });
	};

	let status: SyncStatus = "idle";
	if (failure?.status === "reauth") status = "reauth";
	else if (!signedIn) status = "signedOut";
	else if (provider === "github" && !device.repository) status = "needsRepository";
	else if (busy) status = "syncing";
	else if (pendingChoice) status = "needsChoice";
	else if (failure) status = failure.status;

	return (
		<SyncContext.Provider
			value={{
				available,
				providers: availableProviders,
				provider,
				status,
				errorKind: failure?.kind ?? null,
				errorStatus: failure?.httpStatus ?? null,
				repository: device.repository,
				lastSyncAt: device.lastSyncAt,
				conflicts,
				pendingChoice,
				settings: {
					autoSync: device.autoSync,
					syncOnReturn: device.syncOnReturn,
					waitOnMetered: device.waitOnMetered,
				},
				setSyncSetting,
				deviceName: device.deviceName,
				setDeviceName,
				activity: device.activity,
				cloudCopy: (device.state?.base as SyncDocument | undefined) ?? null,
				signIn,
				installApp,
				completeSignIn,
				listRepositories,
				chooseRepository,
				syncNow,
				keepLocalValue,
				dismissConflicts: () => setConflicts([]),
				signOut,
			}}
		>
			{children}
		</SyncContext.Provider>
	);
}

/** For display only components, which show nothing where no provider is mounted. */
export const useOptionalSync = () => useContext(SyncContext) ?? null;

export function useSync() {
	const context = useContext(SyncContext);
	if (context === undefined) {
		throw new Error("useSync must be used within a SyncProvider");
	}
	return context;
}
