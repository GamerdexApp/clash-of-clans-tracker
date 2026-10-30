import Image from "next/image";
import type { Playthrough } from "@/types/app";
import { overviewText } from "@/lib/messages/overview";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { builderLeagueInfo } from "@/service/leagues";
import {
	builderBaseState,
	builderItemGroups,
	builderProgressCards,
	builderResources,
	daysAtBuilderHall,
} from "@/service/overview";
import { ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { ItemGroup } from "./ItemGroup";
import { ItemTile } from "./ItemTile";
import { LeagueButton } from "./LeagueButton";
import { ProgressCards } from "./ProgressCards";
import { ResourceList } from "./ResourceList";

const text = overviewText.builder;

/** The Builder Base section. It has three states: locked below Town Hall 6, Builder Hall not set, and open. */
export const BuilderBasePanel = ({ village, now }: { village: Playthrough; now: Date }) => {
	const state = builderBaseState(village);
	if (state === "locked") {
		return (
			<Card dimmed className="flex flex-col gap-1 p-4">
				<h2 className="text-lg font-semibold">{text.title}</h2>
				<span className="text-muted">{text.lockedBody}</span>
			</Card>
		);
	}
	if (state === "notSet") {
		return (
			<EmptyState
				title={text.notSetTitle}
				description={text.notSetBody}
				actions={
					<ButtonLink href="/mass-edit?scope=builder" variant="primary">
						{text.notSetAction}
					</ButtonLink>
				}
			/>
		);
	}

	const bb = village.data.builderBase;
	const days = daysAtBuilderHall(village);
	const league = builderLeagueInfo(village);
	const groups = builderItemGroups(village, now);

	return (
		<section aria-labelledby="overview-builder" className="flex flex-col gap-3">
			<Card className="flex flex-wrap items-center gap-4 p-4">
				<span className="relative size-10 shrink-0">
					<Image
						src={toPublicImageUrl(
							`images/builder/builder-hall/normal/level-${bb.builderHallLevel}.png`
						)}
						alt=""
						fill
						sizes="40px"
						className="object-contain"
					/>
				</span>
				<div className="flex min-w-32 flex-1 flex-col">
					<h2 id="overview-builder" className="text-lg font-semibold">
						{text.title}
					</h2>
					<span className="text-muted text-sm">
						{text.hall(bb.builderHallLevel)}
						{bb.builderBaseTrophies > 0
							? `, ${text.trophies(bb.builderBaseTrophies)}`
							: ""}
					</span>
				</div>
				<ResourceList rows={builderResources(village)} />
				{league && <LeagueButton league={league} />}
				{days > 0 && (
					<div className="flex flex-col items-end leading-tight">
						<span className="font-mono text-xl font-semibold">{days}</span>
						<span className="text-muted font-mono text-[11px] tracking-[0.08em] uppercase">
							{text.daysAt(bb.builderHallLevel)}
						</span>
					</div>
				)}
			</Card>
			<ProgressCards cards={builderProgressCards(village)} />
			<div className="grid gap-3 lg:grid-cols-2">
				<ItemGroup title={text.troops} href="/builder-base/troops">
					{groups.troops.map((item) => (
						<ItemTile key={item.name} item={item} />
					))}
				</ItemGroup>
				<ItemGroup title={text.heroes} href="/builder-base/upgrades?tab=heroes">
					{groups.heroes.map((item) => (
						<ItemTile key={item.name} item={item} />
					))}
				</ItemGroup>
			</div>
		</section>
	);
};
