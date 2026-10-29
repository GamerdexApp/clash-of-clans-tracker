"use client";

import { formatDuration } from "@/lib/format";
import { useDailiesActions } from "@/lib/hooks/useDailiesActions";
import { dailiesText } from "@/lib/messages/dailies";
import { type AssigningHelper } from "@/service/helperAssignments";
import { assignableUpgrades, assignmentView, previewHelperUse } from "@/service/helpers";
import { readLevel } from "@/service/upgradeEngine";
import { targetName } from "@/service/upgradeLabels";
import { Button } from "@/comps/ui/Button";
import { Field } from "@/comps/ui/Field";
import { Select } from "@/comps/ui/Select";
import { SegmentedControl } from "@/comps/ui/SegmentedControl";
import type { Playthrough } from "@/types/app";

const text = dailiesText.helpers.assignment;

interface AssignmentPanelProps {
	village: Playthrough;
	helper: AssigningHelper;
	now: Date;
}

/** Chooses the running upgrade a helper speeds up, for one use or until the upgrade is done. */
export const AssignmentPanel = ({ village, helper, now }: AssignmentPanelProps) => {
	const actions = useDailiesActions(village);
	const upgrades = assignableUpgrades(village, helper, now);
	const view = assignmentView(village, helper, now);
	const preview = previewHelperUse(village, helper, now);
	const isBuilder = helper === "buildersApprentice";

	const optionLabel = ({ target, upgrade }: (typeof upgrades)[number]) =>
		text.upgradeTo(targetName(target), readLevel(village, target) + 1, formatDuration(Date.parse(upgrade.finishesAt) - now.getTime()));

	return (
		<div className="flex flex-col gap-3">
			<h3 className="font-semibold">{isBuilder ? text.builderTitle : text.researchTitle}</h3>
			{upgrades.length === 0 ? (
				<p className="text-muted">{isBuilder ? text.builderEmpty : text.researchEmpty}</p>
			) : (
				<>
					<Field label={text.select} hint={isBuilder ? text.builderHelp : text.researchHelp}>
						<Select
							value={view ? JSON.stringify(view.target) : ""}
							onChange={(event) => {
								const chosen = upgrades.find(({ target }) => JSON.stringify(target) === event.target.value);
								actions.assign(helper, chosen?.target ?? null);
							}}
						>
							<option value="">{text.none}</option>
							{upgrades.map((candidate) => (
								<option key={JSON.stringify(candidate.target)} value={JSON.stringify(candidate.target)}>
									{optionLabel(candidate)}
								</option>
							))}
						</Select>
					</Field>
					{view && (
						<SegmentedControl
							label={text.mode}
							value={view.assignment.mode}
							onChange={(mode) => actions.setMode(helper, mode)}
							options={[
								{ id: "once", label: text.once },
								{ id: "continuous", label: text.untilDone },
							]}
						/>
					)}
				</>
			)}
			{view && (
				<div className="border-line bg-tint flex flex-col gap-1 rounded-md border-[1.5px] p-3">
					<span className="text-muted text-xs">{text.assignedTo}</span>
					<span className="font-medium">
						{text.upgradeTo(targetName(view.target), readLevel(village, view.target) + 1, formatDuration(view.finishesAt - now.getTime()))}
					</span>
					<span className="text-muted text-sm">{view.assignment.mode === "once" ? text.clearsAfterUse : text.staysUntilDone}</span>
					{preview && (
						<span className="text-sm">
							{preview.afterMs === 0
								? text.previewDone(formatDuration(preview.remainingMs))
								: text.preview(formatDuration(preview.remainingMs), formatDuration(preview.afterMs))}
						</span>
					)}
					<div>
						<Button variant="link" onClick={() => actions.clearAssignment(helper)}>
							{text.clear}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

