"use client";

import { builderText } from "@/lib/messages/builder";
import { readLevel } from "@/service/upgradeEngine";
import { upgradeSteps } from "@/service/upgradeSteps";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Masonry } from "@/comps/ui/Masonry";
import type { BuildingsTabProps } from "@/types/components/builder";
import { BuildingCard } from "./BuildingCard";

const text = builderText.empty;

export const BuildingsTab = ({ village, buildings, record, base = "home", hideMax, ...handlers }: BuildingsTabProps) => {
	const isFullyUpgraded = (building: BuildingsTabProps["buildings"][number]) =>
		Array.from({ length: building.instanceCount }, (_, instanceIndex) => ({
			kind: base === "builderBase" ? ("bbBuilding" as const) : ("building" as const),
			record,
			buildingId: building.id,
			instanceIndex,
		})).every(
			(target) => readLevel(village, target) >= building.maxLevel && upgradeSteps(village, target).length === 0
		);

	if (buildings.length === 0) return <EmptyState title={text.title} description={text.description} />;

	const shown = hideMax ? buildings.filter((building) => !isFullyUpgraded(building)) : buildings;
	if (shown.length === 0) return <EmptyState title={text.title} description={text.allMax} />;

	return (
		<Masonry>
			{shown.map((building) => (
				<BuildingCard
					key={building.id}
					village={village}
					building={building}
					record={record}
					base={base}
					{...handlers}
				/>
			))}
		</Masonry>
	);
};
