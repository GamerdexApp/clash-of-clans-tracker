"use client";

import Image from "next/image";
import { useState } from "react";
import { LuLock } from "react-icons/lu";
import type { Playthrough } from "@/types/app";
import { formatNumber } from "@/lib/format";
import { commonText } from "@/lib/messages/common";
import { overviewText } from "@/lib/messages/overview";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { capitalHallOf } from "@/service/capital";
import { capitalOverview, capitalOverviewState, type DistrictCardData } from "@/service/overview";
import { Button, ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import { ProgressCards } from "./ProgressCards";

const text = overviewText.capital;
const FIRST_ZONES = 8;

const hallImage = (zone: DistrictCardData) =>
	toPublicImageUrl(
		zone.isCapital
			? `images/clan-capital/halls/capital-hall/normal/level-${zone.hallLevel}.png`
			: `images/clan-capital/halls/district-hall/normal/level-${Math.min(zone.hallLevel, 5)}.png`
	);

const ZoneCard = ({ zone }: { zone: DistrictCardData }) => {
	if (!zone.open) {
		return (
			<Card dimmed className="flex items-center gap-3 p-3">
				<span className="bg-surface flex size-12 shrink-0 items-center justify-center rounded-md">
					<LuLock aria-hidden="true" size={22} className="text-muted" />
				</span>
				<div className="flex min-w-0 flex-col">
					<h3 className="font-semibold">{zone.label}</h3>
					<span className="text-muted text-sm">{text.notUnlocked}</span>
					<span className="text-muted text-xs">{zone.needsDistrictHall ? text.needsDistrictHall : text.unlocksAt(zone.unlocksAt)}</span>
				</div>
			</Card>
		);
	}
	return (
		<Card className="flex items-center gap-3 p-3">
			<span className="relative size-12 shrink-0">
				<Image src={hallImage(zone)} alt="" fill sizes="48px" className="object-contain" />
			</span>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<h3 className="font-semibold">{zone.label}</h3>
				<span className="text-muted text-xs">
					{zone.isCapital
						? overviewText.capital.hall(zone.hallLevel)
						: text.districtHall(zone.hallLevel)}
				</span>
				{zone.progress.max > 0 ? (
					<>
						<span className="font-mono text-sm">
							{zone.progress.pct}%{" "}
							<span className="text-muted text-xs">
								{formatNumber(zone.progress.current)} /{" "}
								{formatNumber(zone.progress.max)}
							</span>
						</span>
						<ProgressBar
							value={zone.progress.pct / 100}
							label={commonText.progressLabel(zone.label)}
							tone={zone.progress.pct >= 100 ? "kept" : "primary"}
						/>
					</>
				) : (
					<span className="text-muted text-xs">{text.noData}</span>
				)}
			</div>
		</Card>
	);
};

/** The Clan Capital section. Tracking off hides it. Below Town Hall 3 it is locked, and with no Capital Hall it asks for one. */
export const ClanCapitalPanel = ({ village }: { village: Playthrough }) => {
	const [expanded, setExpanded] = useState(false);
	const state = capitalOverviewState(village);
	if (state === "off") return null;
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
					<ButtonLink href="/mass-edit?scope=capital" variant="primary">
						{text.notSetAction}
					</ButtonLink>
				}
			/>
		);
	}

	const overview = capitalOverview(village);
	const shown = expanded ? overview.districts : overview.districts.slice(0, FIRST_ZONES);
	const hidden = overview.districts.length - shown.length;

	return (
		<section aria-labelledby="overview-capital" className="flex flex-col gap-3">
			<Card className="flex flex-wrap items-center gap-4 p-4">
				<span className="relative size-10 shrink-0">
					<Image
						src={toPublicImageUrl(
							`images/clan-capital/halls/capital-hall/normal/level-${capitalHallOf(village) || 1}.png`
						)}
						alt=""
						fill
						sizes="40px"
						className="object-contain"
					/>
				</span>
				<div className="flex flex-col">
					<h2 id="overview-capital" className="text-lg font-semibold">
						{text.title}
					</h2>
					<span className="text-muted text-sm">{text.hall(capitalHallOf(village))}</span>
				</div>
			</Card>
			<ProgressCards cards={overview.cards} columns="md:grid-cols-3" />
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{shown.map((zone) => (
					<ZoneCard key={zone.id} zone={zone} />
				))}
			</div>
			{(hidden > 0 || expanded) && (
				<div className="flex flex-wrap items-center gap-3">
					<Button onClick={() => setExpanded(!expanded)}>
						{expanded ? text.showFewer : text.more(hidden)}
					</Button>
					<ButtonLink href="/clan-capital/districts">{text.openDistricts}</ButtonLink>
				</div>
			)}
		</section>
	);
};
