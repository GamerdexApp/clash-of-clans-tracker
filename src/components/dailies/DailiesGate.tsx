"use client";

import type { ReactNode } from "react";

import { dailiesText } from "@/lib/messages/dailies";
import { lockedRequirement } from "@/service/navAccess";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import type { NavItemId } from "@/data/nav";
import type { Playthrough } from "@/types/app";
import { DailiesLocked } from "./DailiesLocked";

interface DailiesGateProps {
	id: Extract<NavItemId, "forge" | "helpers" | "seasonPass">;
	title: string;
	children: (village: Playthrough) => ReactNode;
}

/** A page of the Dailies group opens when its requirement is met. Otherwise the group's locked board shows where the village stands. */
export const DailiesGate = ({ id, title, children }: DailiesGateProps) => (
	<VillageGate title={title}>
		{(village) => {
			if (lockedRequirement(id, village) === null) return <>{children(village)}</>;
			return (
				<>
					<PageHeader
						title={title}
						subline={dailiesText.locked.subline(village.name, village.data.homeVillage.townHallLevel)}
					/>
					<DailiesLocked village={village} />
				</>
			);
		}}
	</VillageGate>
);
