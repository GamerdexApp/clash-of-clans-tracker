"use client";

import { useId } from "react";

import { villagesText } from "@/lib/messages/villages";
import { formatDate } from "@/lib/format";
import { clanCapitalState } from "@/service/navAccess";
import { daysSince } from "@/service/villageList";
import { Badge } from "@/comps/ui/Badge";
import { Button, ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import type { VillageCardProps } from "@/types/components/villages";

const text = villagesText.card;
const CAPITAL_TONES = { on: "kept", off: "locked", locked: "locked" } as const;

const Figure = ({ label, value }: { label: string; value: string }) => (
	<div className="flex flex-col">
		<span className="text-muted text-xs">{label}</span>
		<span className="font-mono font-medium">{value}</span>
	</div>
);

const dayCount = (since: string | undefined) => {
	const days = daysSince(since);
	return days === null ? text.notSet : String(days);
};

export const VillageCard = ({ village, isActive, onSetActive, onEdit, onDelete }: VillageCardProps) => {
	const titleId = useId();
	const capital = clanCapitalState(village);

	return (
		<Card role="group" aria-labelledby={titleId} highlighted={isActive} className="flex flex-col gap-3 p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-col">
					<h2 id={titleId} className="truncate text-lg font-semibold">
						{village.name}
					</h2>
					<span className="text-muted">
						{text.halls(village.data.homeVillage.townHallLevel, village.data.builderBase.builderHallLevel)}
					</span>
				</div>
				{isActive && <Badge tone="kept">{text.active}</Badge>}
			</div>
			{village.description && <p className="text-muted">{village.description}</p>}
			<div className="bg-bg grid grid-cols-2 gap-3 rounded-md px-3 py-2.5">
				<Figure label={text.daysAtTownHall} value={dayCount(village.thChangedAt)} />
				<Figure label={text.daysAtBuilderHall} value={dayCount(village.bhChangedAt)} />
				<div className="flex flex-col gap-1">
					<span className="text-muted text-xs">{text.clanCapital}</span>
					<span>
						<Badge tone={CAPITAL_TONES[capital]}>{text.clanCapitalStates[capital]}</Badge>
					</span>
				</div>
			</div>
			<p className="text-muted flex flex-col text-xs">
				<span>{text.created(formatDate(village.createdAt))}</span>
				<span>{text.lastModified(formatDate(village.lastModified))}</span>
			</p>
			<div className="flex flex-wrap gap-2">
				{isActive ? (
					<ButtonLink href="/overview" variant="primary" className="max-sm:basis-full sm:flex-1">
						{text.openOverview}
					</ButtonLink>
				) : (
					<Button variant="primary" className="max-sm:basis-full sm:flex-1" onClick={onSetActive}>
						{text.setActive}
					</Button>
				)}
				<Button className="max-sm:flex-1" onClick={onEdit}>
					{text.edit}
				</Button>
				<Button variant="danger" className="max-sm:flex-1" onClick={onDelete}>
					{text.delete}
				</Button>
			</div>
		</Card>
	);
};
