"use client";

import { useState } from "react";

import { formatNumber } from "@/lib/format";
import { useWallActions } from "@/lib/hooks/useWallActions";
import type { builderWallsText, wallsText } from "@/lib/messages/walls";
import { PageHeader } from "@/comps/shell/PageHeader";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { SummaryTile } from "@/comps/ui/SummaryTile";
import { SwitchRow } from "@/comps/ui/Switch";
import { MassEditLink } from "@/comps/upgrades/MassEditLink";
import type { Playthrough } from "@/types/app";
import type { WallRules } from "@/types/app/walls";
import { WallRow } from "./WallRow";

type WallsText = typeof wallsText | typeof builderWallsText;

const unplacedCaption = (text: WallsText, unplaced: number) => {
	if (unplaced === 0) return text.tiles.allPlaced;
	return unplaced > 0 ? text.tiles.stillToPlace(unplaced) : text.tiles.over(-unplaced);
};

interface WallsViewProps {
	village: Playthrough;
	rules: WallRules;
	text: WallsText;
	massEditScope: "home" | "builder";
}

export const WallsView = ({ village, rules, text, massEditScope }: WallsViewProps) => {
	const actions = useWallActions(village, rules);
	const [hideEmpty, setHideEmpty] = useState(true);

	const hall = rules.hallLevel(village);
	const levels = rules.wallLevelsAt(hall);
	const highest = rules.highestWallLevel(hall);
	const unplaced = rules.unplacedWalls(village);
	const lowest = rules.lowestPlacedLevel(village);
	const listed = hideEmpty ? levels.filter((level) => level.level >= lowest) : levels;
	const cost = rules.costToHighest(village);

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, hall, highest)} />
			<MassEditLink hint={text.massEdit} scope={massEditScope} tab="walls" />
			<div className="grid gap-3 sm:grid-cols-3">
				<SummaryTile label={text.tiles.total} value={formatNumber(rules.totalWallsAt(hall))} caption={text.tiles.totalCaption(highest)} />
				<SummaryTile label={text.tiles.placed} value={formatNumber(rules.placedWalls(village))} caption={text.tiles.placedCaption} />
				<SummaryTile
					label={text.tiles.notPlaced}
					value={formatNumber(Math.abs(unplaced))}
					caption={unplacedCaption(text, unplaced)}
					emphasis={unplaced === 0}
				/>
			</div>
			<div className="max-w-sm">
				<SwitchRow
					label={text.hideEmpty(levels.length - listed.length)}
					checked={hideEmpty}
					onChange={setHideEmpty}
				/>
			</div>
			{listed.length === 0 ? (
				<EmptyState title={text.empty.title} description={text.empty.description} />
			) : (
				<div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
					{listed.map((level) => (
						<WallRow
							rules={rules}
							key={level.level}
							level={level}
							count={rules.wallCount(village, level.level)}
							maxCount={rules.maxCountFor(village, level.level)}
							highest={highest}
							hall={hall}
							nextCost={level.level < highest ? rules.movePrice(level.level, level.level + 1, 1) : null}
							onMove={actions.move}
							onSetCount={actions.setCount}
						/>
					))}
				</div>
			)}
			<Card className="flex flex-col gap-3 p-4">
				<h2 className="text-base font-semibold">{text.cost.title(highest)}</h2>
				{cost.rows.length === 0 ? (
					<p className="text-muted">{text.cost.none}</p>
				) : (
					<>
						<ul className="flex flex-col gap-1.5">
							{cost.rows.map((row) => (
								<li key={row.level} className="border-line flex flex-wrap items-center justify-between gap-2 border-t-[1.5px] pt-1.5 first:border-t-0 first:pt-0">
									<span>{text.cost.row(row.level, row.walls)}</span>
									<span className="font-mono">{formatNumber(row.price.amount)}</span>
								</li>
							))}
						</ul>
						<div className="border-line flex flex-wrap items-center justify-between gap-2 border-t-[1.5px] pt-2 font-semibold">
							<span>{text.cost.total}</span>
							<span className="font-mono">
								{formatNumber(cost.total.amount)} {cost.total.resource}
							</span>
						</div>
					</>
				)}
				<p className="text-muted text-xs">{text.cost.note}</p>
			</Card>
		</>
	);
};
