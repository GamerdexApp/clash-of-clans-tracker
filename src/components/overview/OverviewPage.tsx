"use client";

import { useNow } from "@/lib/hooks/useNow";
import { overviewText } from "@/lib/messages/overview";
import { achievementList, starProgress } from "@/service/achievements";
import { overviewStats } from "@/service/overview";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { SummaryTile } from "@/comps/ui/SummaryTile";
import type { Playthrough } from "@/types/app";
import { DailiesPanel } from "./DailiesPanel";
import { HomeVillagePanel } from "./HomeVillagePanel";
import { PlayerHeaderCard } from "./PlayerHeaderCard";

const text = overviewText;

const OverviewView = ({ village }: { village: Playthrough }) => {
	const now = new Date(useNow());
	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name)} />
			<PlayerHeaderCard village={village} achievements={starProgress(achievementList(village))} />
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
				{overviewStats(village).map((tile) => (
					<SummaryTile key={tile.id} label={tile.label} value={tile.value} caption={tile.sub} />
				))}
			</div>
			<DailiesPanel village={village} now={now} />
			<HomeVillagePanel village={village} now={now} />
		</>
	);
};

export const OverviewPage = () => (
	<VillageGate title={text.title}>{(village) => <OverviewView village={village} />}</VillageGate>
);
