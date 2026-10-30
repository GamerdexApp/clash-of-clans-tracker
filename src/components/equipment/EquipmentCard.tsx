"use client";

import Image from "next/image";

import { equipmentText } from "@/lib/messages/equipment";
import {
  highestAllowedLevel,
  isFree,
  remainingSteps,
  stepRequirement,
  totalOre,
} from "@/service/equipment";
import { Badge } from "@/comps/ui/Badge";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import { ValueStepper } from "@/comps/ui/ValueStepper";
import type { EquipmentCardProps } from "@/types/components/equipment";
import { OreAmounts } from "./OreAmounts";

const text = equipmentText.card;
const ROWS_SHOWN = 3;

export const EquipmentCard = ({ piece, heroName, level, blacksmith, onUpgrade, onSetLevel }: EquipmentCardProps) => {
	const steps = remainingSteps(piece, level);
	const next = steps[0];
	const atMax = next === undefined;
	const needs = next ? stepRequirement(next, blacksmith) : null;
	const allowed = highestAllowedLevel(piece, blacksmith);
	const shown = steps.slice(0, ROWS_SHOWN);
	const hidden = steps.length - shown.length;
	const left = totalOre(steps);

	return (
		<Card role="group" aria-label={piece.name} className="flex flex-col gap-3 p-4">
			<div className="flex items-start gap-3">
				{piece.imageUrl && (
					<Image
						src={piece.imageUrl}
						alt=""
						width={48}
						height={48}
						style={{ width: 48, height: 48 }}
						className="shrink-0 object-contain"
					/>
				)}
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h3 className="truncate text-base font-semibold">{piece.name}</h3>
						<Badge tone={piece.rarity === "Epic" ? "warn" : "locked"}>{piece.rarity}</Badge>
					</div>
					<span className="text-muted text-xs">{text.heroLine(heroName)}</span>
					<span className="flex flex-wrap items-center gap-2">
						<span className="font-mono text-sm">
							{level === 0 ? text.notOwned : text.level(level, piece.maxLevel)}
						</span>
						{atMax && <Badge tone="kept">{text.max}</Badge>}
					</span>
					<ProgressBar value={Math.min(1, level / piece.maxLevel)} label={text.progress(piece.name)} tone="kept" />
				</div>
			</div>

			{shown.length > 0 && (
				<ul className="flex flex-col gap-1.5">
					{shown.map((step) => {
						const required = stepRequirement(step, blacksmith);
						return (
							<li
								key={step.level}
								className="border-line flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-t-[1.5px] pt-1.5 first:border-t-0 first:pt-0"
							>
								<span className="flex flex-col gap-0.5">
									<span className="font-mono text-sm font-medium">{text.stepLevel(step.level)}</span>
									<OreAmounts ore={step.ore} />
								</span>
								<span className="flex flex-col items-end text-xs">
									<span className="text-muted">{text.time}</span>
									{required !== null && <span className="text-danger">{text.requires(required)}</span>}
								</span>
							</li>
						);
					})}
					{hidden > 0 && (
						<li className="border-line text-muted rounded-md border-[1.5px] border-dashed px-2 py-1 text-center text-xs">
							{text.moreLevels(hidden)}
						</li>
					)}
				</ul>
			)}

			<div className="flex flex-wrap items-center justify-between gap-2">
				<ValueStepper
					label={text.setLevel(piece.name)}
					value={level}
					min={0}
					max={piece.maxLevel}
					onChange={(next) => onSetLevel(next)}
					suffix={`/ ${piece.maxLevel}`}
				/>
				{next && (
					<Button variant="primary" disabled={needs !== null} onClick={onUpgrade}>
						{needs !== null ? text.lockedUntil(needs) : level === 0 ? text.add : text.upgradeTo(next.level)}
					</Button>
				)}
			</div>
			{allowed < piece.maxLevel && (
				<p className="text-muted text-xs">
					{allowed === 0 ? text.allowsNone(blacksmith) : text.allows(blacksmith, allowed)}
				</p>
			)}
			{steps.length > 0 && (
				<div className="border-line text-muted flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t-[1.5px] pt-2 text-xs">
					<span>{text.footer(steps.length)}</span>
					{!isFree(left) && <OreAmounts ore={left} />}
				</div>
			)}
		</Card>
	);
};
