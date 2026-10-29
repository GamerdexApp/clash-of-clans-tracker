"use client";

import { Suspense } from "react";

import { builderWallsText } from "@/lib/messages/walls";
import { builderWalls } from "@/service/walls";
import { VillageGate } from "@/comps/shell/VillageGate";
import { WallsView } from "@/comps/walls/WallsView";

export const BuilderBaseWallsPage = () => (
	<Suspense fallback={null}>
		<VillageGate title={builderWallsText.title}>
			{(village) => <WallsView village={village} rules={builderWalls} text={builderWallsText} massEditScope="builder" />}
		</VillageGate>
	</Suspense>
);
