"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { villagesText } from "@/lib/messages/villages";
import { clanCapitalState } from "@/service/navAccess";
import { refreshFromPlayerApi } from "@/service/playerRefresh";
import type { RefreshResult } from "@/service/playerRefresh";
import { fromDateInputValue, toDateInputValue, todayDateInputValue } from "@/service/villageDates";
import { mergeWithBuildingData } from "@/lib/utils/playerApiMapper";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";
import { Note } from "@/comps/ui/Note";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";
import type { VillageData } from "@/types/app/game";
import type { VillageFormValues } from "@/types/components/villages";
import { BuildingFileField } from "./BuildingFileField";
import { PlayerLookup } from "./PlayerLookup";
import { VillageFields } from "./VillageFields";

const text = villagesText.edit;

const initialValues = (village: Playthrough): VillageFormValues => ({
	name: village.name,
	description: village.description ?? "",
	townHallChangedAt: toDateInputValue(village.thChangedAt),
	builderHallChangedAt: toDateInputValue(village.bhChangedAt),
	trackCapital: clanCapitalState(village) !== "off",
});

const EditDialogContent = ({ village, onClose }: { village: Playthrough; onClose: () => void }) => {
	const formId = useId();
	const { updatePlaythrough } = usePlaythrough();
	const showToast = useToast();
	const [values, setValues] = useState(() => initialValues(village));
	const [playerTag, setPlayerTag] = useState(village.data.playerTag ?? "");
	const [refresh, setRefresh] = useState<RefreshResult | null>(null);
	const [buildingData, setBuildingData] = useState<VillageData | null>(null);
	const [buildingFileName, setBuildingFileName] = useState("");
	const [showError, setShowError] = useState(false);

	const name = values.name.trim();
	const startedTrackingOn = clanCapitalState(village) !== "off";

	const applyRefresh = (result: RefreshResult) => {
		setRefresh(result);
		setValues((current) => ({
			...current,
			townHallChangedAt: result.townHallChanged ? todayDateInputValue() : current.townHallChangedAt,
			builderHallChangedAt: result.builderHallChanged
				? todayDateInputValue()
				: current.builderHallChangedAt,
		}));
	};

	const resultingData = (): VillageData => {
		const base = refresh?.data ?? village.data;
		return buildingData ? mergeWithBuildingData(base, buildingData) : base;
	};

	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (name === "") {
			setShowError(true);
			return;
		}
		updatePlaythrough(village.id, {
			name,
			description: values.description.trim() || undefined,
			thChangedAt: fromDateInputValue(values.townHallChangedAt),
			bhChangedAt: fromDateInputValue(values.builderHallChangedAt),
			...(values.trackCapital === startedTrackingOn ? {} : { clanCapitalEnabled: values.trackCapital }),
			data: resultingData(),
		});
		showToast({ variant: "success", title: text.done(name) });
		onClose();
	};

	const townHallChanged = refresh?.townHallChanged || refresh?.builderHallChanged;

	return (
		<Dialog
			open
			onClose={onClose}
			title={text.title}
			footer={
				<>
					<Button onClick={onClose}>{villagesText.fields.cancel}</Button>
					<Button type="submit" form={formId} variant="primary" aria-disabled={name === ""}>
						{text.submit}
					</Button>
				</>
			}
		>
			<form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
				<VillageFields
					values={values}
					onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
					showNameError={showError}
					townHallLevel={(refresh?.data ?? village.data).homeVillage.townHallLevel}
				/>
				<h3 className="font-medium">{text.refreshTitle}</h3>
				<PlayerLookup
					tag={playerTag}
					onTagChange={setPlayerTag}
					fetchLabel={villagesText.lookup.refresh}
					onFetched={(_player, apiData) => applyRefresh(refreshFromPlayerApi(village.data, apiData))}
					result={
						refresh && (
							<div className="flex flex-col gap-2">
								<Note title={text.updatedTitle}>{refresh.updated.join(", ")}.</Note>
								<Note title={text.untouchedTitle}>{refresh.untouched.join(", ")}.</Note>
								{townHallChanged && <p className="text-muted">{text.dateSet}</p>}
							</div>
						)
					}
				/>
				{refresh && (
					<BuildingFileField
						fileName={buildingFileName}
						onLoaded={(data, fileName) => {
							setBuildingData(data);
							setBuildingFileName(fileName);
						}}
					/>
				)}
			</form>
		</Dialog>
	);
};

export const EditVillageDialog = ({
	village,
	onClose,
}: {
	village: Playthrough | null;
	onClose: () => void;
}) => (village ? <EditDialogContent village={village} onClose={onClose} /> : null);
