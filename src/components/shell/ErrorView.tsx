"use client";

import { useState } from "react";

import { shellText } from "@/lib/messages/shell";
import { STORAGE_KEY } from "@/service/storage";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";

const text = shellText.error;

const todayKey = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/** Saves what the browser holds as a file, so a broken save can be repaired. Returns false when there is nothing to save. */
const downloadRawData = (): boolean => {
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (raw === null) return false;
	const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = `coc-tracker-raw-data-${todayKey()}.json`;
	link.click();
	URL.revokeObjectURL(url);
	return true;
};

interface ErrorViewProps {
	error: Error & { digest?: string };
	reset: () => void;
}

/**
 * The error page. It never clears data on its own. Clearing asks first, and downloads a copy of the
 * raw data before it removes anything.
 */
export const ErrorView = ({ error, reset }: ErrorViewProps) => {
	const [confirming, setConfirming] = useState(false);
	const [hasData] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) !== null);

	const clearAndRestart = () => {
		downloadRawData();
		window.localStorage.removeItem(STORAGE_KEY);
		window.history.replaceState(null, "", "/");
		window.location.reload();
	};

	return (
		<div className="bg-bg text-ink flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
			<h1 className="text-3xl font-semibold">{text.title}</h1>
			<p className="text-muted max-w-md">{text.body}</p>
			<p className="text-muted max-w-md font-mono text-sm break-words">
				{error.message}
				{error.digest ? ` · ${text.digest(error.digest)}` : ""}
			</p>
			<div className="flex flex-wrap justify-center gap-3">
				<Button variant="primary" onClick={reset}>
					{text.tryAgain}
				</Button>
				<Button disabled={!hasData} onClick={downloadRawData}>
					{text.download}
				</Button>
				<Button variant="danger" disabled={!hasData} onClick={() => setConfirming(true)}>
					{text.clear}
				</Button>
			</div>
			{!hasData && <p className="text-muted text-sm">{text.noData}</p>}
			<Dialog
				open={confirming}
				onClose={() => setConfirming(false)}
				title={text.confirmTitle}
				footer={
					<>
						<Button onClick={() => setConfirming(false)}>{text.cancel}</Button>
						<Button variant="danger" onClick={clearAndRestart}>
							{text.confirm}
						</Button>
					</>
				}
			>
				<p className="text-muted">{text.confirmBody}</p>
			</Dialog>
		</div>
	);
};
