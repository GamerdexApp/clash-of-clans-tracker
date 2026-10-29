"use client";

import { builderText } from "@/lib/messages/builder";
import { Button } from "@/comps/ui/Button";
import { EmptyState } from "@/comps/ui/EmptyState";

export const LockedTab = ({
	townHall,
	required,
	onGoToTownHall,
}: {
	townHall: number;
	required: number;
	onGoToTownHall: () => void;
}) => (
	<EmptyState
		title={builderText.gate.requires(required)}
		description={builderText.gate.where(townHall, required)}
		actions={<Button onClick={onGoToTownHall}>{builderText.gate.fix}</Button>}
	/>
);
