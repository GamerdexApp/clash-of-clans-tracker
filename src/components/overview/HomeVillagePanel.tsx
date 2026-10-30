import Image from "next/image";
import type { Playthrough } from "@/types/app";
import { overviewText } from "@/lib/messages/overview";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { homeLeagueInfo } from "@/service/leagues";
import {
	daysAtTownHall,
	homeItemGroups,
	homeProgressCards,
	homeResources,
} from "@/service/overview";
import { Card } from "@/comps/ui/Card";
import { ItemGroup } from "./ItemGroup";
import { ItemTile } from "./ItemTile";
import { LeagueButton } from "./LeagueButton";
import { ProgressCards } from "./ProgressCards";
import { ResourceList } from "./ResourceList";

const text = overviewText.home;

/** The Home Village section: header, nine progress cards and the icons of troops, spells, heroes, siege machines and pets. */
export const HomeVillagePanel = ({ village, now }: { village: Playthrough; now: Date }) => {
	const townHall = village.data.homeVillage.townHallLevel;
	const days = daysAtTownHall(village);
	const league = homeLeagueInfo(village);
	const groups = homeItemGroups(village, now);

	return (
		<section aria-labelledby="overview-home" className="flex flex-col gap-3">
			<Card className="flex flex-wrap items-center gap-4 p-4">
				<span className="relative size-10 shrink-0">
					<Image
						src={toPublicImageUrl(`images/home/town-hall/normal/level-${townHall}.png`)}
						alt=""
						fill
						sizes="40px"
						className="object-contain"
					/>
				</span>
				<div className="flex min-w-32 flex-1 flex-col">
					<h2 id="overview-home" className="text-lg font-semibold">
						{text.title}
					</h2>
					<span className="text-muted text-sm">{text.townHall(townHall)}</span>
				</div>
				<ResourceList rows={homeResources(village)} />
				{league && <LeagueButton league={league} />}
				{days > 0 && (
					<div className="flex flex-col items-end leading-tight">
						<span className="font-mono text-xl font-semibold">{days}</span>
						<span className="text-muted font-mono text-[11px] tracking-[0.08em] uppercase">
							{text.daysAt(townHall)}
						</span>
					</div>
				)}
			</Card>

			<ProgressCards cards={homeProgressCards(village)} />

			<div className="grid gap-3 lg:grid-cols-2">
				<ItemGroup title={text.troops} href="/research">
					{groups.troops.map((item) => (
						<ItemTile key={item.name} item={item} />
					))}
				</ItemGroup>
				<ItemGroup title={text.spells} href="/research">
					{groups.spells.map((item) => (
						<ItemTile key={item.name} item={item} />
					))}
				</ItemGroup>
			</div>
			<div className="grid gap-3 lg:grid-cols-2">
				<ItemGroup title={text.heroes} href="/builder?tab=heroes" grid>
					{groups.heroes.map((hero) => (
						<span
							key={hero.name}
							className="border-line flex items-start gap-3 rounded-md border-[1.5px] p-2"
						>
							<span className="flex w-16 shrink-0 flex-col items-center gap-1">
								<ItemTile item={hero} />
								<span className="text-center text-sm leading-tight font-medium">
									{hero.name}
								</span>
							</span>
							{hero.equipment.length > 0 && (
								<span className="flex min-w-0 flex-1 flex-wrap content-start gap-1">
									{hero.equipment.map((piece) => (
										<ItemTile key={piece.name} item={piece} size="small" />
									))}
								</span>
							)}
						</span>
					))}
				</ItemGroup>
				<div className="flex flex-col gap-3">
					<ItemGroup title={text.pets} href="/pets">
						{groups.pets.map((item) => (
							<ItemTile key={item.name} item={item} size="small" />
						))}
					</ItemGroup>
					<ItemGroup title={text.siege} href="/research">
						{groups.siege.map((item) => (
							<ItemTile key={item.name} item={item} size="small" />
						))}
					</ItemGroup>
				</div>
			</div>
			<p className="text-muted text-xs">{text.legend}</p>
		</section>
	);
};
