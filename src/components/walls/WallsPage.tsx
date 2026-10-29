"use client";

import { Suspense, useState } from "react";

import { formatNumber } from "@/lib/format";
import { useWallActions } from "@/lib/hooks/useWallActions";
import { wallsText } from "@/lib/messages/walls";
import {
  costToHighest,
  highestWallLevel,
  lowestPlacedLevel,
  maxCountFor,
  movePrice,
  placedWalls,
  totalWallsAt,
  unplacedWalls,
  wallCount,
  wallLevelsAt,
} from "@/service/walls";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { SummaryTile } from "@/comps/ui/SummaryTile";
import { SwitchRow } from "@/comps/ui/Switch";
import { MassEditLink } from "@/comps/upgrades/MassEditLink";
import type { Playthrough } from "@/types/app";
import { WallRow } from "./WallRow";

const text = wallsText;

const unplacedCaption = (unplaced: number) => {
	if (unplaced === 0) return text.tiles.allPlaced;
	return unplaced > 0 ? text.tiles.stillToPlace(unplaced) : text.tiles.over(-unplaced);
};

const WallsContent = ({ village }: { village: Playthrough }) => {
	const actions = useWallActions(village);
	const [hideEmpty, setHideEmpty] = useState(true);

	const townHall = village.data.homeVillage.townHallLevel;
	const levels = wallLevelsAt(townHall);
	const highest = highestWallLevel(townHall);
	const unplaced = unplacedWalls(village);
	const lowest = lowestPlacedLevel(village);
	const listed = hideEmpty ? levels.filter((level) => level.level >= lowest) : levels;
	const cost = costToHighest(village);

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, townHall, highest)} />
			<MassEditLink hint={text.massEdit} tab="walls" />
			<div className="grid gap-3 sm:grid-cols-3">
				<SummaryTile label={text.tiles.total} value={formatNumber(totalWallsAt(townHall))} caption={text.tiles.totalCaption(highest)} />
				<SummaryTile label={text.tiles.placed} value={formatNumber(placedWalls(village))} caption={text.tiles.placedCaption} />
				<SummaryTile
					label={text.tiles.notPlaced}
					value={formatNumber(Math.abs(unplaced))}
					caption={unplacedCaption(unplaced)}
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
							key={level.level}
							level={level}
							count={wallCount(village, level.level)}
							maxCount={maxCountFor(village, level.level)}
							highest={highest}
							townHall={townHall}
							nextCost={level.level < highest ? movePrice(level.level, level.level + 1, 1) : null}
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

export const WallsPage = () => (
	<Suspense fallback={null}>
		<VillageGate title={text.title}>{(village) => <WallsContent village={village} />}</VillageGate>
	</Suspense>
);
