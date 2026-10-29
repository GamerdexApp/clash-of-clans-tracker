"use client";

import type { ReactNode } from "react";

import { builderText } from "@/lib/messages/builder";
import { goldPassBoosts } from "@/service/goldPass";
import { builderSlots } from "@/service/upgradeEngine";
import { LanesStrip } from "@/comps/upgrades/LanesStrip";
import type { Playthrough } from "@/types/app";

const text = builderText.builders;

export const BuildersStrip = ({
	village,
	goblin,
	now,
	actions,
}: {
	village: Playthrough;
	goblin: boolean;
	now: number;
	actions: ReactNode;
}) => (
	<LanesStrip
		title={text.title}
		village={village}
		state={builderSlots(village, goblin)}
		now={now}
		stats={[{ label: text.boostLabel, value: text.boostValue(goldPassBoosts(village, new Date(now)).builder) }]}
		actions={actions}
		queueHref="/builder/queue"
		queueLabel={text.openQueue}
		emptyNote={text.noBuilders}
		unassignedHelp={text.unassignedHelp}
	/>
);
