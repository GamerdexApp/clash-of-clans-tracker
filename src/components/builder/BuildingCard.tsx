"use client";

import Image from "next/image";
import { useId, useState } from "react";

import { builderText } from "@/lib/messages/builder";
import { readLevel } from "@/service/upgradeEngine";
import { targetName } from "@/service/upgradeLabels";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import type { UpgradeTarget } from "@/types/app/engine";
import type { BuildingCardProps } from "@/types/components/builder";
import { TargetRow } from "./TargetRow";

const text = builderText.card;
const COLLAPSED_ROWS = 3;

export const BuildingCard = ({
	village,
	building,
	record,
	now,
	onStart,
	onFinish,
	onCancel,
	onLevelChange,
}: BuildingCardProps) => {
	const titleId = useId();
	const [expanded, setExpanded] = useState(false);
	const instances = Array.from({ length: building.instanceCount }, (_, index) => index);
	const visible = expanded ? instances : instances.slice(0, COLLAPSED_ROWS);

	const targetFor = (instanceIndex: number): UpgradeTarget => ({
		kind: "building",
		record,
		buildingId: building.id,
		instanceIndex,
	});

	const totalLevels = instances.reduce(
		(sum, index) => sum + Math.min(readLevel(village, targetFor(index)), building.maxLevel),
		0
	);
	const maxTotal = building.maxLevel * building.instanceCount;

	return (
		<Card role="group" aria-labelledby={titleId} className="flex flex-col gap-3 p-4">
			<div className="flex items-start gap-3">
				{building.imageUrl && (
					<Image
						src={building.imageUrl}
						alt=""
						width={48}
						height={48}
						style={{ width: 48, height: 48 }}
						className="shrink-0 object-contain"
					/>
				)}
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<h3 id={titleId} className="truncate text-base font-semibold">
						{building.name}
					</h3>
					<span className="text-muted text-xs">{text.maxAtHall(building.maxLevel)}</span>
					<ProgressBar
						value={maxTotal === 0 ? 1 : totalLevels / maxTotal}
						label={text.progress(building.name)}
						tone="kept"
					/>
				</div>
			</div>
			<ul className="flex flex-col gap-2">
				{visible.map((instanceIndex) => {
					const target = targetFor(instanceIndex);
					const instance = village.data.homeVillage[record][building.id]?.[instanceIndex];

					return (
						<TargetRow
							key={instanceIndex}
							village={village}
							target={target}
							name={targetName(target)}
							maxLevel={building.maxLevel}
							now={now}
							prefix={
								<span className="text-muted font-mono text-xs">{text.instance(instanceIndex + 1)}</span>
							}
							note={
								building.superchargeTiers > 0 &&
								readLevel(village, target) >= building.maxLevel && (
									<span className="text-muted text-xs">
										{text.supercharge(instance?.superchargeLevel ?? 0, building.superchargeTiers)}
									</span>
								)
							}
							onStart={onStart}
							onFinish={onFinish}
							onCancel={onCancel}
							onLevelChange={onLevelChange}
						/>
					);
				})}
			</ul>
			{instances.length > COLLAPSED_ROWS && (
				<div>
					<Button variant="link" onClick={() => setExpanded((open) => !open)}>
						{expanded ? text.showFewer : text.showAll(instances.length)}
					</Button>
				</div>
			)}
		</Card>
	);
};
