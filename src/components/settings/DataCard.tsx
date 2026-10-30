"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { LuDownload, LuUpload } from "react-icons/lu";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useOptionalSync } from "@/lib/contexts/SyncContext";
import { settingsText } from "@/lib/messages/settings";
import { syncText } from "@/lib/messages/sync";
import { backupFileName, downloadBackup } from "@/service/backup";
import type { ImportMode } from "@/service/backup";
import { defaultSettings } from "@/service/migrate";
import { Badge } from "@/comps/ui/Badge";
import { Button } from "@/comps/ui/Button";
import { Checkbox } from "@/comps/ui/Checkbox";
import { Note } from "@/comps/ui/Note";
import { useToast } from "@/comps/ui/Toast";
import type { AppData } from "@/types/app";
import type { ImportFile } from "@/types/components/settings";
import { ImportDialog } from "./ImportDialog";
import { SettingsCard } from "./SettingsCard";

const text = settingsText.data;
const sectionClasses = "border-line flex flex-col gap-2 border-t-[1.5px] pt-3";
const EMPTY_DATA: AppData = { playthroughs: [], activePlaythroughId: null, settings: defaultSettings };

export const DataCard = () => {
	const showToast = useToast();
	const { appData, playthroughs, updateData } = usePlaythrough();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [chosenFile, setChosenFile] = useState<File | null>(null);
	const [reviewedFile, setReviewedFile] = useState<ImportFile | null>(null);
	const [importMode, setImportMode] = useState<ImportMode>("merge");
	const [confirmingReset, setConfirmingReset] = useState(false);
	const [alsoDeleteSyncedCopy, setAlsoDeleteSyncedCopy] = useState(false);
	const sync = useOptionalSync();
	const syncProvider = sync?.status === "signedOut" ? null : (sync?.provider ?? null);

	const exportBackup = () => {
		showToast({ variant: "success", title: text.export.done, message: downloadBackup(appData) });
	};

	const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
		setChosenFile(event.target.files?.[0] ?? null);
	};

	const reviewImport = async () => {
		if (!chosenFile) return;
		setImportMode("merge");
		setReviewedFile({ name: chosenFile.name, size: chosenFile.size, text: await chosenFile.text() });
	};

	const confirmImport = (next: AppData, summary: string, mode: ImportMode) => {
		const previous = updateData(() => next);
		if (!previous) return;
		setReviewedFile(null);
		setChosenFile(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		showToast({
			variant: "success",
			title: mode === "merge" ? text.import.merged : text.import.replaced,
			message: summary,
			action: { label: text.import.undo, onAction: () => updateData(() => previous) },
		});
	};

	/**
	 * With sync on, keeping the synced copy disconnects this browser, so the next sync cannot bring
	 * the villages back. Deleting it keeps sync on, so the empty data reaches the other devices.
	 */
	const confirmReset = () => {
		const disconnect = syncProvider !== null && !alsoDeleteSyncedCopy;
		const previous = updateData(() => EMPTY_DATA);
		if (!previous) return;
		if (disconnect) sync?.signOut();
		setConfirmingReset(false);
		setAlsoDeleteSyncedCopy(false);
		showToast({
			variant: "warning",
			title: text.reset.done,
			message: disconnect
				? text.reset.doneMessageDisconnected(previous.playthroughs.length)
				: text.reset.doneMessage(previous.playthroughs.length),
			action: { label: text.reset.undo, onAction: () => updateData(() => previous) },
		});
	};

	const names = new Intl.ListFormat(undefined, { type: "conjunction" }).format(
		playthroughs.map((village) => village.name)
	);

	return (
		<SettingsCard title={text.title} aside={<Badge tone="added">{text.villageCount(playthroughs.length)}</Badge>}>
			<section className={sectionClasses}>
				<h3 className="font-medium">{text.export.title}</h3>
				<p className="text-muted">{text.export.description}</p>
				<div>
					<Button onClick={exportBackup}>
						<LuDownload size={16} aria-hidden="true" />
						{text.export.button}
					</Button>
				</div>
				<code className="text-muted font-mono text-xs break-all">{backupFileName()}</code>
			</section>
			<section className={sectionClasses}>
				<h3 className="font-medium">{text.import.title}</h3>
				<input
					ref={fileInputRef}
					type="file"
					accept=".json,application/json"
					aria-label={text.import.fileLabel}
					onChange={chooseFile}
					className="sr-only"
					tabIndex={-1}
				/>
				<div className="flex flex-wrap items-center gap-3">
					<Button onClick={() => fileInputRef.current?.click()}>
						<LuUpload size={16} aria-hidden="true" />
						{text.import.chooseFile}
					</Button>
					<span className="text-muted break-all">{chosenFile?.name ?? text.import.noFile}</span>
				</div>
				<p className="text-muted">{text.import.description}</p>
				<div>
					<Button variant="primary" disabled={!chosenFile} onClick={reviewImport}>
						{text.import.review}
					</Button>
				</div>
			</section>
			<section className={sectionClasses}>
				<h3 className="font-medium">{text.reset.title}</h3>
				<p className="text-muted">{text.reset.warning}</p>
				{confirmingReset ? (
					<Note tone="warning" title={text.reset.confirmTitle}>
						<span className="flex flex-col gap-3">
							<span>{text.reset.confirmBody(names)}</span>
							{syncProvider && (
								<span className="flex flex-col gap-1">
									<Checkbox
										label={text.reset.syncedCopy(syncText.provider[syncProvider].name)}
										checked={alsoDeleteSyncedCopy}
										onChange={setAlsoDeleteSyncedCopy}
									/>
									<span className="text-muted">
										{alsoDeleteSyncedCopy ? text.reset.syncedOn : text.reset.syncedOff}
									</span>
								</span>
							)}
							<span className="flex flex-wrap gap-2">
								<Button data-autofocus onClick={() => setConfirmingReset(false)}>
									{text.reset.cancel}
								</Button>
								<Button variant="danger" onClick={confirmReset}>
									{text.reset.confirm}
								</Button>
							</span>
						</span>
					</Note>
				) : (
					<div>
						<Button
							variant="danger"
							disabled={playthroughs.length === 0}
							onClick={() => setConfirmingReset(true)}
						>
							{text.reset.button}
						</Button>
					</div>
				)}
			</section>
			<ImportDialog
				file={reviewedFile}
				current={appData}
				mode={importMode}
				onModeChange={setImportMode}
				onClose={() => setReviewedFile(null)}
				onConfirm={confirmImport}
			/>
		</SettingsCard>
	);
};
