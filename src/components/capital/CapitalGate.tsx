"use client";

import type { ReactNode } from "react";

import { useCapitalActions } from "@/lib/hooks/useCapitalActions";
import { capitalText } from "@/lib/messages/capital";
import { clanCapitalState } from "@/service/navAccess";
import { PageHeader } from "@/comps/shell/PageHeader";
import { VillageGate } from "@/comps/shell/VillageGate";
import { Button, ButtonLink } from "@/comps/ui/Button";
import { EmptyState } from "@/comps/ui/EmptyState";
import type { Playthrough } from "@/types/app";

const text = capitalText;

const TrackingOff = ({ title, village }: { title: string; village: Playthrough }) => {
	const actions = useCapitalActions(village);
	return (
		<>
			<PageHeader title={title} />
			<EmptyState
				title={text.off.title}
				description={`${text.off.description} ${text.off.kept}`}
				actions={
					<Button variant="primary" onClick={() => actions.setTracking(true)}>
						{text.off.turnOn}
					</Button>
				}
			/>
		</>
	);
};

/** Locked below Town Hall 3, Off when the player turned tracking off, otherwise the page. */
export const CapitalGate = ({ title, children }: { title: string; children: (village: Playthrough) => ReactNode }) => (
	<VillageGate title={title}>
		{(village) => {
			const state = clanCapitalState(village);
			if (state === "locked") {
				return (
					<>
						<PageHeader title={title} />
						<EmptyState
							title={text.locked.title}
							description={text.locked.description(village.data.homeVillage.townHallLevel)}
							actions={<ButtonLink href="/villages" variant="primary">{text.locked.action}</ButtonLink>}
						/>
					</>
				);
			}
			if (state === "off") return <TrackingOff title={title} village={village} />;
			return <>{children(village)}</>;
		}}
	</VillageGate>
);
