import { clan as clanData } from "clash-of-clans-data";
import Image from "next/image";
import Link from "next/link";
import type { Playthrough } from "@/types/app";
import { overviewText } from "@/lib/messages/overview";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { StarProgress } from "@/service/achievements";
import { Card } from "@/comps/ui/Card";

const text = overviewText.header;
const clanLevels = clanData().levels();
const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const clanBanner = (level: number) =>
	toPublicImageUrl((clanLevels.atLevel(level) as { image?: string } | undefined)?.image ?? "");

const AchievementRing = ({ progress }: { progress: StarProgress }) => (
	<Link
		href="/achievements"
		className="flex flex-col items-center gap-1"
		aria-label={`${text.achievements}, ${progress.percent}%, ${text.viewAll}`}
	>
		<span className="relative size-[72px]">
			<svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
				<circle
					cx="36"
					cy="36"
					r={RADIUS}
					fill="none"
					strokeWidth="7"
					className="stroke-track"
				/>
				<circle
					cx="36"
					cy="36"
					r={RADIUS}
					fill="none"
					strokeWidth="7"
					strokeLinecap="round"
					strokeDasharray={`${(progress.percent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
					transform="rotate(-90 36 36)"
					className="stroke-primary"
				/>
			</svg>
			<span className="absolute inset-0 flex items-center justify-center font-mono text-base font-semibold">
				{progress.percent}%
			</span>
		</span>
		<span className="text-muted font-mono text-[11px] tracking-[0.08em] uppercase">
			{text.achievements}
		</span>
		<span className="text-muted text-xs">
			{text.ringCaption(progress.stars, progress.maxStars)}
		</span>
	</Link>
);

/** The player at the top: Town Hall, name, tag, clan and the shared achievement ring. */
export const PlayerHeaderCard = ({
	village,
	achievements,
}: {
	village: Playthrough;
	achievements: StarProgress;
}) => {
	const { data } = village;
	const townHall = data.homeVillage.townHallLevel;
	const clan = data.clan && data.clan.clanLevel > 0 ? data.clan : null;

	return (
		<Card className="flex flex-wrap items-center gap-4 p-4">
			<span className="relative size-16 shrink-0">
				<Image
					src={toPublicImageUrl(`images/home/town-hall/normal/level-${townHall}.png`)}
					alt=""
					fill
					sizes="64px"
					className="object-contain"
				/>
				<span className="bg-primary text-on-primary absolute -end-1 -bottom-1 rounded px-1 font-mono text-[11px] leading-4 font-semibold">
					{text.townHall(townHall)}
				</span>
			</span>
			<div className="flex min-w-40 flex-1 flex-col">
				<h2 className="truncate text-xl font-semibold">{village.name}</h2>
				{data.playerTag && (
					<span className="text-muted font-mono text-sm">{data.playerTag}</span>
				)}
			</div>
			{clan && (
				<div className="flex items-center gap-3">
					<span className="relative size-14 shrink-0">
						<Image
							src={clanBanner(clan.clanLevel)}
							alt=""
							fill
							sizes="56px"
							className="object-contain"
						/>
					</span>
					<div className="flex flex-col leading-tight">
						<span className="font-semibold">{clan.name}</span>
						<span className="text-muted text-sm capitalize">
							{text.clanLevel(clan.clanLevel, clan.role)}
						</span>
					</div>
				</div>
			)}
			<AchievementRing progress={achievements} />
		</Card>
	);
};
