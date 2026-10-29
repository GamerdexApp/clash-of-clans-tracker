"use client";

import { useMemo } from "react";

import { formatShortDate } from "@/lib/format";
import { settingsText } from "@/lib/messages/settings";
import { applyImport, parseBackup, planImport, summarizeImport } from "@/service/backup";
import type { ImportMode } from "@/service/backup";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";
import { Note } from "@/comps/ui/Note";
import { RadioGroup } from "@/comps/ui/RadioGroup";
import { ScrollRegion } from "@/comps/ui/ScrollRegion";
import type { ImportDialogProps } from "@/types/components/settings";

const text = settingsText.importDialog;
const MODE_OPTIONS = (["merge", "replace"] as const).map((id) => ({ id, label: text.modes[id] }));
const KILOBYTE = 1024;

const formatSize = (bytes: number) =>
	bytes < KILOBYTE ? text.bytes(bytes) : text.kilobytes(Math.max(1, Math.round(bytes / KILOBYTE)));
const formatDate = (iso?: string) => (iso ? formatShortDate(iso) : text.notThere);

export const ImportDialog = ({ file, current, mode, onModeChange, onClose, onConfirm }: ImportDialogProps) => {
	const parsed = useMemo(() => (file ? parseBackup(file.text) : null), [file]);
	const incoming = parsed?.ok ? parsed.data : null;
	const rows = useMemo(
		() => (incoming ? planImport(current, incoming, mode) : []),
		[current, incoming, mode]
	);
	const summary = summarizeImport(rows)
		.map(({ result, count }) => text.summary[result](count))
		.join(", ");

	const checksText = (read: number, skipped: number, kept: number) =>
		[text.checks(read, kept), skipped > 0 && text.skipped(skipped)].filter(Boolean).join(" ");

	return (
		<Dialog
			open={file !== null}
			onClose={onClose}
			variant="wide"
			title={text.title}
			description={file ? text.fileInfo(file.name, formatSize(file.size)) : undefined}
			footer={
				incoming ? (
					<>
						<Button onClick={onClose}>{text.cancel}</Button>
						<Button
							variant={mode === "replace" ? "danger" : "primary"}
							onClick={() => onConfirm(applyImport(current, incoming, mode), summary, mode)}
						>
							{text[mode]}
						</Button>
					</>
				) : (
					<Button onClick={onClose}>{text.close}</Button>
				)
			}
		>
			{parsed && !parsed.ok && (
				<Note tone="warning" title={text.failedTitle}>
					{text.errors[parsed.error]}
				</Note>
			)}
			{parsed?.ok && (
				<>
					<Note title={text.checksTitle}>
						{checksText(parsed.stats.read, parsed.stats.skipped, parsed.data.playthroughs.length)}
					</Note>
					<div className="flex flex-col gap-2">
						<h3 className="font-medium">{text.howToApply}</h3>
						<RadioGroup label={text.modeLabel} options={MODE_OPTIONS} value={mode} onChange={onModeChange} />
						<p className="text-muted">{text.modeNotes[mode]}</p>
					</div>
					<div className="flex flex-col gap-2">
						<h3 className="font-medium">{text.whatChanges}</h3>
						<ScrollRegion label={text.whatChanges}>
							<table className="w-full text-start">
								<thead className="text-muted text-xs">
									<tr>
										<th className="py-1 pe-3 font-medium">{text.columns.village}</th>
										<th className="py-1 pe-3 font-medium">{text.columns.inFile}</th>
										<th className="py-1 pe-3 font-medium">{text.columns.onDevice}</th>
										<th className="py-1 font-medium">{text.columns.result}</th>
									</tr>
								</thead>
								<tbody>
									{rows.map((row, index) => (
										<tr key={index} className="border-line border-t-[1.5px] align-top">
											<td className="py-2 pe-3 font-medium">{row.name}</td>
											<td className="py-2 pe-3">{formatDate(row.fileModified)}</td>
											<td className="py-2 pe-3">{formatDate(row.deviceModified)}</td>
											<td className="py-2">{text.results[row.result]}</td>
										</tr>
									))}
								</tbody>
							</table>
						</ScrollRegion>
						<p className="text-muted">{summary || text.noVillages}</p>
						<p className="text-muted">{text.undoNote}</p>
					</div>
				</>
			)}
		</Dialog>
	);
};
