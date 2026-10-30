"use client";

import Image from "next/image";
import { useState } from "react";

import { useCapitalActions } from "@/lib/hooks/useCapitalActions";
import { capitalText } from "@/lib/messages/capital";
import type { BuildingEditData } from "@/lib/utils/massEditHelpers";
import {
  buildingLevels,
  capitalHallOf,
  districtHallRequirement,
  groupBuildings,
  maxDistrictHall,
  placedWalls,
  topDistrictHall,
  wallCountAt,
  zoneHall,
  zoneLabel,
  zoneWalls,
} from "@/service/capital";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Field } from "@/comps/ui/Field";
import { NumberStepper } from "@/comps/ui/NumberStepper";
import { Select } from "@/comps/ui/Select";
import { Tabs } from "@/comps/ui/Tabs";
import type { Playthrough } from "@/types/app";
import type { CapitalGroup, ZoneId } from "@/types/app/capital";

const text = capitalText.panel;
const GROUPS: CapitalGroup[] = ["defenses", "traps", "army", "walls"];

interface ZonePanelProps {
	village: Playthrough;
	zoneId: ZoneId;
	actions: ReturnType<typeof useCapitalActions>;
	onDistrictHall: (zoneId: ZoneId, level: number) => void;
}

const BuildingCard = ({
	village,
	zoneId,
	building,
	actions,
}: {
	village: Playthrough;
	zoneId: ZoneId;
	building: BuildingEditData;
	actions: ZonePanelProps["actions"];
}) => {
	const levels = buildingLevels(village, zoneId, building);
	return (
		<Card role="group" aria-label={building.name} className="flex flex-col gap-3 p-4">
			<div className="flex flex-wrap items-center gap-3">
				{building.imageUrl && (
					<Image src={building.imageUrl} alt="" width={40} height={40} style={{ width: 40, height: 40 }} className="shrink-0 object-contain" />
				)}
				<div className="flex min-w-0 flex-1 basis-32 flex-col">
					<h3 className="truncate text-base font-semibold">{building.name}</h3>
					<span className="text-muted text-xs">
						{text.instances(building.instanceCount)}, {text.maxLevel(building.maxLevel)}
					</span>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => actions.setGroup(zoneId, "defenses", [building], "clear")}>{text.clear}</Button>
					<Button onClick={() => actions.setGroup(zoneId, "defenses", [building], "max")}>{text.max}</Button>
				</div>
			</div>
			<div className="flex flex-wrap gap-x-4 gap-y-2">
				{levels.map((level, index) => (
					<span key={index} className="flex items-center gap-2">
						{levels.length > 1 && <span className="text-muted font-mono text-xs">{index + 1}</span>}
						<NumberStepper
							value={level}
							min={0}
							max={building.maxLevel}
							step={1}
							label={text.instance(building.name, index)}
							raiseLabel={text.raise(text.instance(building.name, index))}
							lowerLabel={text.lower(text.instance(building.name, index))}
							onChange={(next) => actions.setBuilding(zoneId, building, index, next)}
						/>
					</span>
				))}
			</div>
		</Card>
	);
};

const WallsGroup = ({ village, zoneId, actions }: Omit<ZonePanelProps, "onDistrictHall">) => {
	const info = zoneWalls(zoneId, zoneHall(village, zoneId));
	if (info.totalCount === 0) return <EmptyState title={text.wallsNone} description={text.empty} />;
	const placed = placedWalls(village, zoneId);
	return (
		<div className="flex flex-col gap-3">
			<p className="text-muted">{text.wallsLeft(info.totalCount - placed, info.totalCount)}</p>
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{info.levels.map((level) => {
					const count = wallCountAt(village, zoneId, level.level);
					return (
						<Card key={level.level} role="group" aria-label={text.wallLevel(level.level)} className="flex items-center justify-between gap-3 p-3">
							<span className="flex items-center gap-2.5">
								{level.imageUrl && (
									<Image src={level.imageUrl} alt="" width={36} height={36} style={{ width: 36, height: 36 }} className="shrink-0 object-contain" />
								)}
								<span className="font-medium">{text.wallLevel(level.level)}</span>
							</span>
							<NumberStepper
								value={count}
								min={0}
								max={count + (info.totalCount - placed)}
								step={1}
								label={text.wallCount(level.level)}
								raiseLabel={text.wallRaise(level.level)}
								lowerLabel={text.wallLower(level.level)}
								onChange={(next) => actions.setWall(zoneId, level.level, next)}
							/>
						</Card>
					);
				})}
			</div>
			<p className="text-muted text-xs">{text.wallsNote}</p>
		</div>
	);
};

/** One zone: its District Hall, then Defenses, Traps, Army and Walls. */
export const ZonePanel = ({ village, zoneId, actions, onDistrictHall }: ZonePanelProps) => {
	const [group, setGroup] = useState<CapitalGroup>("defenses");
	const isPeak = zoneId === "capitalPeak";
	const hall = zoneHall(village, zoneId);
	const capitalHall = capitalHallOf(village);
	const allowed = isPeak ? 0 : maxDistrictHall(zoneId, capitalHall);

	const lists = {
		defenses: groupBuildings(zoneId, hall, "defenses"),
		traps: groupBuildings(zoneId, hall, "traps"),
		army: groupBuildings(zoneId, hall, "army"),
	};
	const tabs = GROUPS.filter((id) => !(isPeak && id === "army")).map((id) => ({
		id,
		label: text.groups[id],
		count: id === "walls" ? zoneWalls(zoneId, hall).totalCount : lists[id].length,
	}));
	const active = tabs.some((tab) => tab.id === group) ? group : "defenses";
	const buildings = active === "walls" ? [] : lists[active];

	return (
		<Card className="flex flex-col gap-4 p-4">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<h2 className="text-lg font-semibold">{zoneLabel(zoneId)}</h2>
				{!isPeak && (
					<Field label={text.districtHall}>
						<Select value={hall} onChange={(event) => onDistrictHall(zoneId, Number(event.target.value))}>
							<option value={0}>{text.noHall}</option>
							{Array.from({ length: topDistrictHall(zoneId) }, (_, index) => index + 1).map((level) => (
								<option key={level} value={level} disabled={level > allowed}>
									{level > allowed
										? `${level}, ${text.requires(districtHallRequirement(zoneId, level) ?? 0)}`
										: level}
								</option>
							))}
						</Select>
					</Field>
				)}
			</div>
			{!isPeak && hall === 0 ? (
				<EmptyState title={text.noHall} description={text.empty} />
			) : (
				<Tabs label={text.groupsLabel} tabs={tabs} activeId={active} onChange={setGroup}>
					{active === "walls" ? (
						<WallsGroup village={village} zoneId={zoneId} actions={actions} />
					) : buildings.length === 0 ? (
						<EmptyState title={text.groups[active]} description={text.empty} />
					) : (
						<div className="flex flex-col gap-3">
							<div className="flex flex-wrap justify-end gap-2">
								<Button onClick={() => actions.setGroup(zoneId, active, buildings, "clear")}>{text.resetAll}</Button>
								<Button onClick={() => actions.setGroup(zoneId, active, buildings, "max")}>{text.maxAll}</Button>
							</div>
							<div className="grid gap-3 xl:grid-cols-2">
								{buildings.map((building) => (
									<BuildingCard key={building.id} village={village} zoneId={zoneId} building={building} actions={actions} />
								))}
							</div>
						</div>
					)}
				</Tabs>
			)}
		</Card>
	);
};
