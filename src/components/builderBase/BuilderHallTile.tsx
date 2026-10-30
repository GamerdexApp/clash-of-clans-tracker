"use client";

import Image from "next/image";
import { useState } from "react";

import { useBuilderBaseActions } from "@/lib/hooks/useBuilderBaseActions";
import { builderBaseText } from "@/lib/messages/builderBase";
import { builderHallImageUrl } from "@/service/builderBaseSteps";
import { TargetRow } from "@/comps/builder/TargetRow";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Checkbox } from "@/comps/ui/Checkbox";
import { Dialog } from "@/comps/ui/Dialog";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { UpgradeHandlers } from "@/types/components/builder";

const text = builderBaseText.hall;
const MAX_BUILDER_HALL = 10;
const DAY_MS = 86_400_000;
const BUILDER_HALL: UpgradeTarget = { kind: "builderHall" };

const explanation = (from: number, to: number) => {
	if (to === 0) return text.confirm.clearing;
	return to > from ? text.confirm.raising : text.confirm.lowering;
};

const ConfirmContent = ({
	from,
	to,
	onConfirm,
	onClose,
}: {
	from: number;
	to: number;
	onConfirm: (setDaysToToday: boolean) => void;
	onClose: () => void;
}) => {
	const [setDays, setSetDays] = useState(to > from);

	return (
		<Dialog
			open
			onClose={onClose}
			title={text.confirm.title(to)}
			description={explanation(from, to)}
			footer={
				<>
					<Button onClick={onClose}>{text.confirm.cancel}</Button>
					<Button
						variant="primary"
						onClick={() => {
							onConfirm(setDays);
							onClose();
						}}
					>
						{text.confirm.confirm}
					</Button>
				</>
			}
		>
			{to > 0 && <Checkbox label={text.confirm.setDays} checked={setDays} onChange={setSetDays} />}
		</Dialog>
	);
};

/**
 * The Builder Hall, as the Town Hall tile on the Builder page: a level stepper and an Upgrade button
 * that runs on a builder. Setting the level by hand asks first, because every list follows it.
 */
export const BuilderHallTile = ({
	village,
	now,
	handlers,
}: {
	village: Playthrough;
	now: number;
	handlers: UpgradeHandlers;
}) => {
	const actions = useBuilderBaseActions(village);
	const [pending, setPending] = useState<number | null>(null);
	const level = village.data.builderBase.builderHallLevel;
	const days = village.bhChangedAt ? Math.max(0, Math.floor((now - Date.parse(village.bhChangedAt)) / DAY_MS)) : null;
	const image = builderHallImageUrl(level);

	return (
		<Card className="flex flex-col gap-3 p-4">
			<div className="flex items-center gap-3">
				{image && (
					<Image src={image} alt="" width={64} height={64} style={{ width: 64, height: 64 }} className="shrink-0 object-contain" />
				)}
				<div className="flex flex-col">
					<h2 className="text-base font-semibold">{text.title}</h2>
					<span className="text-muted">
						{level === 0 ? text.notSet : days !== null ? text.since(days, level) : text.option(level)}
					</span>
				</div>
			</div>
			<ul>
				<TargetRow
					village={village}
					target={BUILDER_HALL}
					name={text.title}
					maxLevel={MAX_BUILDER_HALL}
					now={now}
					hideStepperAtZero={false}
					{...handlers}
					onLevelChange={(_target, next) => next !== level && setPending(next)}
				/>
			</ul>
			{pending !== null && (
				<ConfirmContent
					from={level}
					to={pending}
					onConfirm={(setDaysToToday) => actions.setBuilderHall(pending, { setDaysToToday })}
					onClose={() => setPending(null)}
				/>
			)}
		</Card>
	);
};
