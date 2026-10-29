"use client";

import { Suspense } from "react";

import { wallsText } from "@/lib/messages/walls";
import { homeWalls } from "@/service/walls";
import { VillageGate } from "@/comps/shell/VillageGate";
import { WallsView } from "./WallsView";

export const WallsPage = () => (
	<Suspense fallback={null}>
		<VillageGate title={wallsText.title}>
			{(village) => <WallsView village={village} rules={homeWalls} text={wallsText} massEditScope="home" />}
		</VillageGate>
	</Suspense>
);
