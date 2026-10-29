"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { villagesText } from "@/lib/messages/villages";
import { fromDateInputValue } from "@/service/villageDates";
import { mergeWithBuildingData } from "@/lib/utils/playerApiMapper";
import { createDefaultVillageData } from "@/lib/utils/villageHelpers";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";
import { Note } from "@/comps/ui/Note";
import { RadioGroup } from "@/comps/ui/RadioGroup";
import { SwitchRow } from "@/comps/ui/Switch";
import { useToast } from "@/comps/ui/Toast";
import type { PlayerApiResponse } from "@/types/app";
import type { VillageData } from "@/types/app/game";
import type { CreationMode, VillageFormValues } from "@/types/components/villages";
import { BuildingFileField } from "./BuildingFileField";
import { PlayerLookup } from "./PlayerLookup";
import { VillageFields } from "./VillageFields";

const text = villagesText.create;
const MODE_OPTIONS = [
	{ id: "fresh" as const, label: text.modes.fresh },
	{ id: "import" as const, label: text.modes.import },
];

const emptyValues: VillageFormValues = {
	name: "",
	description: "",
	townHallChangedAt: "",
	builderHallChangedAt: "",
	trackCapital: true,
};

const CreateDialogContent = ({ onClose }: { onClose: () => void }) => {
	const formId = useId();
	const { addPlaythrough } = usePlaythrough();
	const showToast = useToast();
	const [mode, setMode] = useState<CreationMode>("fresh");
	const [values, setValues] = useState(emptyValues);
	const [levels, setLevels] = useState({ townHall: 1, builderHall: 1 });
	const [makeActive, setMakeActive] = useState(true);
	const [playerTag, setPlayerTag] = useState("");
	const [player, setPlayer] = useState<PlayerApiResponse | null>(null);
	const [apiData, setApiData] = useState<VillageData | null>(null);
	const [buildingData, setBuildingData] = useState<VillageData | null>(null);
	const [buildingFileName, setBuildingFileName] = useState("");
	const [showError, setShowError] = useState(false);

	const name = values.name.trim();
	const townHallLevel = mode === "fresh" ? levels.townHall : (apiData?.homeVillage.townHallLevel ?? 1);
	const needsLookup = mode === "import" && apiData === null;

	const changeMode = (next: CreationMode) => {
		setMode(next);
		setPlayer(null);
		setApiData(null);
		setBuildingData(null);
		setBuildingFileName("");
	};

	const villageData = (): VillageData => {
		if (mode === "fresh") return createDefaultVillageData(levels.townHall, levels.builderHall);
		return buildingData ? mergeWithBuildingData(apiData!, buildingData) : apiData!;
	};

	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (name === "") {
			setShowError(true);
			return;
		}
		if (needsLookup) return;

		const id = addPlaythrough(
			{
				name,
				description: values.description.trim() || undefined,
				thChangedAt: fromDateInputValue(values.townHallChangedAt),
				bhChangedAt: fromDateInputValue(values.builderHallChangedAt),
				...(values.trackCapital ? {} : { clanCapitalEnabled: false }),
				data: villageData(),
			},
			{ makeActive }
		);
		if (!id) return;
		showToast({ variant: "success", title: text.done(name) });
		onClose();
	};

	return (
		<Dialog
			open
			onClose={onClose}
			title={text.title}
			footer={
				<>
					<Button onClick={onClose}>{villagesText.fields.cancel}</Button>
					<Button
						type="submit"
						form={formId}
						variant="primary"
						aria-disabled={name === "" || needsLookup}
					>
						{text.submit}
					</Button>
				</>
			}
		>
			<form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
				<RadioGroup
					label={text.modeLabel}
					options={MODE_OPTIONS}
					value={mode}
					onChange={changeMode}
				/>
				<p className="text-muted">{text.modeNotes[mode]}</p>
				{mode === "import" && (
					<>
						<h3 className="font-medium">{villagesText.lookup.step1}</h3>
						<PlayerLookup
							tag={playerTag}
							onTagChange={setPlayerTag}
							fetchLabel={villagesText.lookup.fetch}
							onFetched={(fetched, data) => {
								setPlayer(fetched);
								setApiData(data);
								if (!values.name.trim()) setValues((v) => ({ ...v, name: fetched.name }));
							}}
							result={
								player && (
									<Note>
										{villagesText.lookup.found(
											player.name,
											player.townHallLevel,
											player.builderHallLevel ?? 0,
											player.achievements?.length ?? 0,
											player.troops?.length ?? 0
										)}
									</Note>
								)
							}
						/>
						<h3 className="font-medium">{villagesText.lookup.step2}</h3>
						<BuildingFileField
							fileName={buildingFileName}
							onLoaded={(data, fileName) => {
								setBuildingData(data);
								setBuildingFileName(fileName);
							}}
						/>
					</>
				)}
				<VillageFields
					values={values}
					onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
					showNameError={showError}
					townHallLevel={townHallLevel}
					levels={
						mode === "fresh"
							? {
									...levels,
									onChange: (townHall, builderHall) => setLevels({ townHall, builderHall }),
								}
							: undefined
					}
				/>
				<SwitchRow label={text.makeActive} checked={makeActive} onChange={setMakeActive} />
				{needsLookup && showError && <Note tone="warning">{text.importNeedsLookup}</Note>}
			</form>
		</Dialog>
	);
};

export const CreateVillageDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) =>
	open ? <CreateDialogContent onClose={onClose} /> : null;
