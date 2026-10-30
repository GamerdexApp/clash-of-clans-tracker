"use client";

import { useNow } from "@/lib/hooks/useNow";
import { dailiesText } from "@/lib/messages/dailies";
import { PageHeader } from "@/comps/shell/PageHeader";
import { Masonry } from "@/comps/ui/Masonry";
import { Note } from "@/comps/ui/Note";
import type { Playthrough } from "@/types/app";
import { AlchemistCard } from "./AlchemistCard";
import { AssistantCard } from "./AssistantCard";
import { DailiesGate } from "./DailiesGate";
import { ProspectorCard } from "./ProspectorCard";

const text = dailiesText.helpers;

const HelpersView = ({ village }: { village: Playthrough }) => {
	const now = new Date(useNow());
	return (
		<>
			<PageHeader
				title={text.title}
				subline={text.subline(village.name, village.data.homeVillage.townHallLevel, village.data.builderBase.builderHallLevel)}
			/>
			<Note>{text.banner}</Note>
			<Masonry>
				<AssistantCard village={village} helper="buildersApprentice" now={now} />
				<AssistantCard village={village} helper="labAssistant" now={now} />
				<AlchemistCard village={village} now={now} />
				<ProspectorCard village={village} now={now} />
			</Masonry>
		</>
	);
};

export const HelpersPage = () => (
	<DailiesGate id="helpers" title={text.title}>
		{(village) => <HelpersView village={village} />}
	</DailiesGate>
);
