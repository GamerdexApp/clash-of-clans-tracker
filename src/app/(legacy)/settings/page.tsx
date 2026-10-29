"use client";

import { Alert, Badge, Button, Card, FileInput, Label, ToggleSwitch } from "flowbite-react";
import { useRef, useState } from "react";
import { localTimeToUtcMinutes, utcMinutesToLocalTimeStr } from "@/lib/utils/activeHoursHelpers";
import {
	HiCheckCircle,
	HiDownload,
	HiExclamationCircle,
	HiInformationCircle,
	HiTrash,
	HiUpload,
} from "react-icons/hi";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";

const Settings = () => {
	const { playthroughs, exportData, importData, clearAllData, appSettings, updateSettings } = usePlaythrough();

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [resetModalOpen, setResetModalOpen] = useState(false);

	const [activeStart, setActiveStart] = useState(() =>
		appSettings.activeHours ? utcMinutesToLocalTimeStr(appSettings.activeHours.startUtcMinutes) : "07:00"
	);
	const [activeEnd, setActiveEnd] = useState(() =>
		appSettings.activeHours ? utcMinutesToLocalTimeStr(appSettings.activeHours.endUtcMinutes) : "23:00"
	);

	const [syncedActiveHours, setSyncedActiveHours] = useState(appSettings.activeHours);
	if (appSettings.activeHours !== syncedActiveHours) {
		setSyncedActiveHours(appSettings.activeHours);
		if (appSettings.activeHours) {
			setActiveStart(utcMinutesToLocalTimeStr(appSettings.activeHours.startUtcMinutes));
			setActiveEnd(utcMinutesToLocalTimeStr(appSettings.activeHours.endUtcMinutes));
		}
	}

	const handleSaveActiveHours = () => {
		updateSettings({
			activeHours: {
				startUtcMinutes: localTimeToUtcMinutes(activeStart),
				endUtcMinutes: localTimeToUtcMinutes(activeEnd),
			},
		});
	};

	const handleClearActiveHours = () => {
		updateSettings({ activeHours: undefined });
		setActiveStart("07:00");
		setActiveEnd("23:00");
	};
	const [resetSuccess, setResetSuccess] = useState(false);
	const [importStatus, setImportStatus] = useState<{
		show: boolean;
		success: boolean;
		message: string;
	} | null>(null);

	const handleExportData = () => {
		const data = exportData();
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `coc-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleImportData = () => {
		if (!fileInputRef.current?.files?.length) return;

		const file = fileInputRef.current.files[0];
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const result = importData(content);

				setImportStatus({
					show: true,
					success: result.success,
					message: result.success
						? "Data imported successfully!"
						: `Import failed: ${result.error}`,
				});

				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}

				if (result.success) {
					setTimeout(() => setImportStatus(null), 5000);
				}
			} catch (error) {
				setImportStatus({
					show: true,
					success: false,
					message: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		};

		reader.readAsText(file);
	};

	const handleResetConfirm = () => {
		clearAllData();
		setResetSuccess(true);
		setTimeout(() => setResetSuccess(false), 3000);
	};

	return (
		<>
		<DeleteConfirmModal
			isOpen={resetModalOpen}
			onClose={() => setResetModalOpen(false)}
			onConfirm={handleResetConfirm}
			title="Reset All Data"
			message="This will permanently delete all villages and cannot be undone. Make sure you have exported a backup first."
		/>
		<section className="min-h-screen bg-highlight p-8 dark:bg-gray-900">
			<div className="mx-auto">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
					<p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
						Manage your data and application settings
					</p>
				</div>

				<div className="mb-8">
					<Alert color="info" icon={HiInformationCircle}>
						<div className="mb-1 text-lg font-medium">Local Storage</div>
						<p className="mb-1">
							Your data is stored locally in the browser. Data is lost when the
							browser cache is cleared.
						</p>
						<p>Use the functions below to export and backup your data regularly.</p>
					</Alert>
				</div>

				{importStatus?.show && (
					<Alert
						color={importStatus.success ? "success" : "failure"}
						icon={importStatus.success ? HiCheckCircle : HiExclamationCircle}
						onDismiss={() => setImportStatus(null)}
						className="mb-6"
					>
						{importStatus.message}
					</Alert>
				)}

				<div className="mb-4">
					<Card>
						<h2 className="mb-4 text-xl font-bold text-white">Builder Settings</h2>
						<div className="space-y-4">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="font-medium text-white">Goblin Builder</p>
									<p className="text-sm text-white/80">Enables a 7th builder slot for buildings. Only available during limited in-game events.</p>
								</div>
								<ToggleSwitch
									checked={appSettings.goblinBuilderEnabled}
									onChange={(checked) => updateSettings({ goblinBuilderEnabled: checked })}
									label=""
								/>
							</div>
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="font-medium text-white">Goblin Researcher</p>
									<p className="text-sm text-white/80">Enables a 2nd research slot in the lab. Only available during limited in-game events.</p>
								</div>
								<ToggleSwitch
									checked={appSettings.goblinResearchEnabled}
									onChange={(checked) => updateSettings({ goblinResearchEnabled: checked })}
									label=""
								/>
							</div>
						</div>
					</Card>
				</div>

				<div className="mb-4">
				<Card>
					<h2 className="mb-4 text-xl font-bold text-white">Active Hours</h2>
					<p className="mb-4 text-sm text-white/80">
						Set the hours you&apos;re actively playing each day. Queue timelines will add a gap when an upgrade finishes outside this window, reflecting when you&apos;ll actually be online to start the next one.
					</p>
					<div className="flex flex-wrap items-end gap-4">
						<div className="flex flex-col gap-1">
							<Label className="text-white/80 text-xs">Start time</Label>
							<input
								type="time"
								value={activeStart}
								onChange={(e) => setActiveStart(e.target.value)}
								className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white scheme-dark"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label className="text-white/80 text-xs">End time</Label>
							<input
								type="time"
								value={activeEnd}
								onChange={(e) => setActiveEnd(e.target.value)}
								className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white scheme-dark"
							/>
						</div>
						<Button onClick={handleSaveActiveHours}>Save</Button>
						{appSettings.activeHours && (
							<Button color="red" onClick={handleClearActiveHours}>Clear</Button>
						)}
					</div>
					{appSettings.activeHours && (
						<p className="mt-3 text-xs text-green-400">Active hours are set and applied to all queue timelines.</p>
					)}
				</Card>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Card>
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-xl font-bold text-white">
								Data Management
							</h2>
							<Badge color="info">
								{playthroughs.length}{" "}
								{playthroughs.length === 1 ? "Village" : "Villages"}
							</Badge>
						</div>

						<div className="space-y-6">
							<div>
								<div className="mb-2">
									<Label className="text-white/80">Export Data</Label>
								</div>
								<Button onClick={handleExportData} className="w-full">
									<HiDownload className="mr-2 h-5 w-5" />
									Export All Villages
								</Button>
								<p className="mt-1 text-sm text-white/80">
									Download a backup file of all your saved playthroughs.
								</p>
							</div>

							<div>
								<div className="mb-2">
									<Label className="text-white/80">Import Data</Label>
								</div>
								<div className="flex flex-col gap-2">
									<FileInput ref={fileInputRef} accept=".json" />
									<p className="text-sm text-white/80">
										Upload a previously exported file (.json)
									</p>
									<Button color="purple" onClick={handleImportData}>
										<HiUpload className="mr-2 h-5 w-5" />
										Import Data
									</Button>
								</div>
							</div>

							<div>
								<div className="mb-2">
									<Label className="text-red-400">Reset All Data</Label>
									{resetSuccess && (
										<span className="ml-2 text-sm text-green-500">
											Data reset successfully
										</span>
									)}
								</div>
								<Button color="red" onClick={() => setResetModalOpen(true)} className="w-full">
									<HiTrash className="mr-2 h-5 w-5" />
									Reset All Data
								</Button>
								<p className="mt-1 text-sm text-red-500">
									Warning: This will delete all playthroughs and cannot be undone.
								</p>
							</div>
						</div>
					</Card>

					<Card>
						<h2 className="mb-4 text-2xl font-bold text-white">
							About
						</h2>
						<div className="space-y-2 text-sm text-white/80">
							<p>
								<strong className="text-white">
									Clash of Clans Tracker
								</strong>
							</p>
							<p>
								A progress tracking tool for Clash of Clans. Track upgrades,
								achievements, and more across multiple accounts. All data is stored
								locally in your browser.
							</p>
						</div>
					</Card>
				</div>
			</div>
		</section>
		</>
	);
}
export default Settings;
