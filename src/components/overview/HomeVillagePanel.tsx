import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Playthrough } from "@/types/app";
import { formatNumber } from "@/lib/format";
import { overviewText } from "@/lib/messages/overview";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import {
	daysAtTownHall,
	homeItemGroups,
	homeProgressCards,
	homeResources,
} from "@/service/overview";
import { Card } from "@/comps/ui/Card";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import { ItemTile } from "./ItemTile";

const text = overviewText.home;

const Group = ({
	title,
	href,
	children,
	grid = false,
}: {
	title: string;
	href: string;
	children: ReactNode;
	grid?: boolean;
}) => (
	<Card className="flex flex-col gap-3 p-4">
		<div className="flex items-center justify-between gap-3">
			<h3 className="font-semibold">{title}</h3>
			<Link href={href} className="text-link text-sm font-medium underline">
				{text.queue}
			</Link>
		</div>
		<div className={grid ? "grid gap-3 sm:grid-cols-2" : "flex flex-wrap gap-1.5"}>
			{children}
		</div>
	</Card>
);

/** The Home Village section: header, nine progress cards and the icons of troops, spells, heroes, siege machines and pets. */
export const HomeVillagePanel = ({ village, now }: { village: Playthrough; now: Date }) => {
	const townHall = village.data.homeVillage.townHallLevel;
	const days = daysAtTownHall(village);
	const resources = homeResources(village);
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
				{resources.length > 0 && (
					<div className="flex gap-4 text-sm">
						{(["perHour", "storage"] as const).map((field) => (
							<ul key={field} className="flex flex-col gap-0.5">
								{resources
									.filter((row) => row[field] > 0)
									.map((row) => (
										<li key={row.id} className="flex items-center gap-1.5">
											<Image
												src={row.image}
												alt={row.label}
												width={14}
												height={14}
												style={{ width: 14, height: 14 }}
												className="object-contain"
											/>
											<span className="font-mono">
												{formatNumber(row[field])}
												{field === "perHour" ? "/h" : ""}
											</span>
										</li>
									))}
							</ul>
						))}
					</div>
				)}
				{days > 0 && (
					<div className="flex flex-col items-end leading-tight">
						<span className="font-mono text-xl font-semibold">{days}</span>
						<span className="text-muted font-mono text-[11px] tracking-[0.08em] uppercase">
							{text.daysAt(townHall)}
						</span>
					</div>
				)}
			</Card>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
				{homeProgressCards(village).map((card) => (
					<Link key={card.id} href={card.href} className="block">
						<Card
							dimmed={card.lock !== undefined}
							className="hover:bg-tint flex h-full flex-col gap-1.5 px-3 py-2.5"
						>
							<span className="text-muted font-mono text-[11px] tracking-[0.08em] uppercase">
								{card.label}
							</span>
							{card.lock ? (
								<span className="text-muted text-sm">
									{text.cards.locked(card.lock)}
								</span>
							) : (
								<>
									<span className="font-mono text-xl">{card.result.pct}%</span>
									<ProgressBar
										value={card.result.pct / 100}
										label={`${card.label} progress`}
										tone={card.result.pct >= 100 ? "kept" : "primary"}
									/>
									<span className="text-muted text-xs">
										{formatNumber(card.result.current)} /{" "}
										{formatNumber(card.result.max)}
										{card.sub ? `, ${card.sub}` : ""}
									</span>
								</>
							)}
						</Card>
					</Link>
				))}
			</div>

			<div className="grid gap-3 lg:grid-cols-2">
				{groups.troops.length > 0 && (
					<Group title={text.troops} href="/research">
						{groups.troops.map((item) => (
							<ItemTile key={item.name} item={item} />
						))}
					</Group>
				)}
				{groups.spells.length > 0 && (
					<Group title={text.spells} href="/research">
						{groups.spells.map((item) => (
							<ItemTile key={item.name} item={item} />
						))}
					</Group>
				)}
			</div>
			<div className="grid gap-3 lg:grid-cols-2">
				{groups.heroes.length > 0 && (
					<Group title={text.heroes} href="/builder?tab=heroes" grid>
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
					</Group>
				)}
				<div className="flex flex-col gap-3">
					{groups.pets.length > 0 && (
						<Group title={text.pets} href="/pets">
							{groups.pets.map((item) => (
								<ItemTile key={item.name} item={item} size="small" />
							))}
						</Group>
					)}
					{groups.siege.length > 0 && (
						<Group title={text.siege} href="/research">
							{groups.siege.map((item) => (
								<ItemTile key={item.name} item={item} size="small" />
							))}
						</Group>
					)}
				</div>
			</div>
			<p className="text-muted text-xs">{text.legend}</p>
		</section>
	);
};
