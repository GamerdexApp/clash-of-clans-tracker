"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { villagesText } from "@/lib/messages/villages";
import { parseBuildingFile } from "@/service/buildingFile";
import { Button } from "@/comps/ui/Button";
import { Note } from "@/comps/ui/Note";
import type { BuildingFileFieldProps } from "@/types/components/villages";

const text = villagesText.lookup;

export const BuildingFileField = ({ fileName, onLoaded }: BuildingFileFieldProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState("");

	const choose = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		const parsed = parseBuildingFile(await file.text());
		if (!parsed.ok) {
			setError(parsed.error === "notJson" ? text.buildingNotJson : text.buildingInvalid);
			onLoaded(null, "");
			return;
		}
		setError("");
		onLoaded(parsed.data, file.name);
	};

	return (
		<div className="flex flex-col gap-2">
			<p className="text-muted">{text.buildingHelp}</p>
			<input
				ref={inputRef}
				type="file"
				accept=".json,application/json"
				aria-label={text.buildingLabel}
				onChange={choose}
				className="sr-only"
				tabIndex={-1}
			/>
			<div className="flex flex-wrap items-center gap-3">
				<Button onClick={() => inputRef.current?.click()}>{text.buildingLabel}</Button>
				<span className="text-muted break-all">{fileName}</span>
			</div>
			{error && <Note tone="warning">{error}</Note>}
			{fileName && <Note>{text.buildingLoaded(fileName)}</Note>}
		</div>
	);
};
