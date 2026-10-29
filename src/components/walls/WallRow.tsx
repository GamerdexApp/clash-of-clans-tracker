"use client";

import Image from "next/image";
import { useState } from "react";

import { formatNumber } from "@/lib/format";
import { wallsText } from "@/lib/messages/walls";
import { movePrice, wallLevelsAt } from "@/service/walls";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Field } from "@/comps/ui/Field";
import { Input } from "@/comps/ui/Input";
import { Select } from "@/comps/ui/Select";
import type { WallRowProps } from "@/types/components/walls";
import { CountField } from "./CountField";

const text = wallsText.row;

export const WallRow = ({ level, count, maxCount, highest, townHall, nextCost, onMove, onSetCount }: WallRowProps) => {
	const [moveText, setMoveText] = useState("");
	const [chosenTo, setChosenTo] = useState<number | null>(null);

	const targets = wallLevelsAt(townHall).filter((candidate) => candidate.level > level.level);
	const toLevel = chosenTo !== null && chosenTo > level.level ? chosenTo : level.level + 1;
	const typed = Math.floor(Number(moveText));
	const typedValid = moveText.trim() !== "" && typed > 0 && typed <= count;
	const preview = (walls: number) => {
		const price = movePrice(level.level, toLevel, walls);
		return text.preview(walls, level.level, toLevel, formatNumber(price.amount), price.resource);
	};

	const move = (walls: number) => {
		onMove(level.level, toLevel, walls);
		setMoveText("");
	};

	return (
		<Card role="group" aria-label={text.level(level.level)} className="flex flex-col gap-3 p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					{level.imageUrl && (
						<Image src={level.imageUrl} alt="" width={40} height={40} style={{ width: 40, height: 40 }} className="shrink-0 object-contain" />
					)}
					<div className="flex flex-col">
						<h3 className="text-base font-semibold">{text.level(level.level)}</h3>
						{nextCost && (
							<span className="text-muted text-xs">
								{text.nextCost(formatNumber(nextCost.amount), nextCost.resource)}
							</span>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-muted whitespace-nowrap">{text.own}</span>
					<CountField level={level.level} value={count} max={maxCount} onCommit={(next) => onSetCount(level.level, next)} />
				</div>
			</div>

			{level.level >= highest ? (
				<p className="text-muted">{text.nothingToMove}</p>
			) : count === 0 ? (
				<p className="text-muted">{text.noWalls}</p>
			) : (
				<div className="border-line flex flex-col gap-2 border-t-[1.5px] pt-3">
					<div className="flex flex-wrap items-end gap-3">
						<Field label={text.toMove}>
							<Input
								type="text"
								inputMode="numeric"
								placeholder={String(count)}
								value={moveText}
								className="w-28 font-mono"
								onChange={(event) => setMoveText(event.target.value)}
								onKeyDown={(event) => event.key === "Enter" && typedValid && move(typed)}
							/>
						</Field>
						{targets.length > 1 && (
							<Field label={text.toLevel}>
								<Select value={toLevel} onChange={(event) => setChosenTo(Number(event.target.value))}>
									{targets.map((target) => (
										<option key={target.level} value={target.level}>
											{target.level}
										</option>
									))}
								</Select>
							</Field>
						)}
						<div className="flex flex-wrap gap-2">
							<Button onClick={() => move(1)}>{text.plusOne}</Button>
							<Button variant="primary" disabled={!typedValid} onClick={() => move(typed)}>
								{text.move}
							</Button>
							<Button onClick={() => move(count)}>{text.moveAll}</Button>
						</div>
					</div>
					<p className="text-muted text-sm">{preview(typedValid ? typed : count)}</p>
				</div>
			)}
		</Card>
	);
};
