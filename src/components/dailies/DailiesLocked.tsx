import type { ReactNode } from "react";

import { dailiesText } from "@/lib/messages/dailies";
import { lockedRequirement } from "@/service/navAccess";
import { Badge } from "@/comps/ui/Badge";
import { ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import type { Playthrough } from "@/types/app";

const text = dailiesText.locked;
const STAR_BONUS_TOWN_HALL = 3;

interface LockCardProps {
	title: string;
	open: boolean;
	need: ReactNode;
	now: ReactNode;
	what: string;
	link: ReactNode;
}

const LockCard = ({ title, open, need, now, what, link }: LockCardProps) => (
	<Card dimmed={!open} className="flex flex-col gap-2 p-4">
		<div className="flex items-center justify-between gap-3">
			<h2 className="text-base font-semibold">{title}</h2>
			<Badge tone={open ? "kept" : "locked"}>{open ? text.open : text.lockedBadge}</Badge>
		</div>
		<p className="font-medium">{need}</p>
		<p className="text-muted">{now}</p>
		<p className="text-muted text-sm">{what}</p>
		<div>{link}</div>
	</Card>
);

/** Shows all of the Dailies group, so a locked page says what is open and what the village still needs. */
export const DailiesLocked = ({ village }: { village: Playthrough }) => {
	const townHall = village.data.homeVillage.townHallLevel;
	const cards = text.cards;
	const requirementOf = (id: "forge" | "helpers" | "seasonPass") => lockedRequirement(id, village);
	const hasHut = requirementOf("helpers") === null;

	return (
		<div className="grid gap-4 md:grid-cols-2">
			{(
				[
					{ id: "forge", href: "/forge", card: cards.forge },
					{ id: "helpers", href: "/helpers", card: cards.helpers },
					{ id: "seasonPass", href: "/season-pass", card: cards.seasonPass },
				] as const
			).map(({ id, href, card }) => {
				const requirement = requirementOf(id);
				const open = requirement === null;
				return (
					<LockCard
						key={id}
						title={card.title}
						open={open}
						need={open ? `${card.title} is open` : id === "helpers" ? text.needsHut : `Requires ${requirement}`}
						now={id === "helpers" && !hasHut ? text.nowNoHut : text.now(townHall)}
						what={card.what}
						link={
							<ButtonLink href={open ? href : "/builder"} variant={open ? "primary" : "secondary"}>
								{open ? `${text.open} ${card.title}` : text.toBuilder}
							</ButtonLink>
						}
					/>
				);
			})}
			<LockCard
				title={cards.starBonus.title}
				open={townHall >= STAR_BONUS_TOWN_HALL}
				need={`Requires Town Hall ${STAR_BONUS_TOWN_HALL}`}
				now={text.now(townHall)}
				what={cards.starBonus.what}
				link={<ButtonLink href="/overview">{cards.starBonus.open}</ButtonLink>}
			/>
		</div>
	);
};
