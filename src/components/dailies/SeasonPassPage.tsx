"use client";

import { formatMonthDay, formatMonthYear } from "@/lib/format";
import Image from "next/image";
import type { ReactNode } from "react";

import { formatDuration } from "@/lib/format";
import { useDailiesActions } from "@/lib/hooks/useDailiesActions";
import { useNow } from "@/lib/hooks/useNow";
import { dailiesText } from "@/lib/messages/dailies";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { dailiesOf } from "@/service/dailies";
import { forgeDurationMs } from "@/service/forge";
import { goldPassBoosts, monthResetDate, rolledBoosts, type GoldPassPerk } from "@/service/goldPass";
import { PageHeader } from "@/comps/shell/PageHeader";
import { Badge } from "@/comps/ui/Badge";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Note } from "@/comps/ui/Note";
import { SegmentedControl } from "@/comps/ui/SegmentedControl";
import { SwitchRow } from "@/comps/ui/Switch";
import type { Playthrough } from "@/types/app";
import type { BoostPercent } from "@/types/app/engine";
import { DailiesGate } from "./DailiesGate";

const text = dailiesText.seasonPass;
const MINUTE_MS = 60_000;
const boostOptions: BoostPercent[] = [0, 10, 15, 20];

const perkRows: { perk: GoldPassPerk; copy: { label: string; note: string }; image: string; referenceOnly: boolean }[] = [
	{ perk: "hoggyBankUnlocked", copy: text.perks.hoggyBank, image: "images/season-pass/pass-items/hoggy-bank.png", referenceOnly: true },
	{ perk: "gemDonationsUnlocked", copy: text.perks.gemDonations, image: "images/season-pass/pass-items/perk-1-gem-donations.png", referenceOnly: true },
	{ perk: "autoForgeUnlocked", copy: text.perks.autoForge, image: "images/season-pass/pass-items/perk-auto-forge.png", referenceOnly: false },
	{
		perk: "requestTimeReductionUnlocked",
		copy: text.perks.requestTimeReduction,
		image: "images/season-pass/pass-items/perk-request-time-reduction.png",
		referenceOnly: true,
	},
];

const PerkImage = ({ path }: { path: string }) => (
	<Image src={toPublicImageUrl(path)} alt="" width={40} height={40} style={{ width: 40, height: 40 }} className="shrink-0 object-contain" />
);

const Panel = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
	<Card className="flex flex-col gap-4 p-4">
		<div className="flex flex-col">
			<h2 className="text-lg font-semibold">{title}</h2>
			{description && <span className="text-muted text-sm">{description}</span>}
		</div>
		{children}
	</Card>
);

const SeasonPassView = ({ village }: { village: Playthrough }) => {
	const now = new Date(useNow(MINUTE_MS));
	const actions = useDailiesActions(village);
	const dailies = dailiesOf(village);
	const boosts = goldPassBoosts(village, now);
	const rolled = rolledBoosts(village, now);
	const monthName = formatMonthYear(now);
	const resetName = formatMonthDay(monthResetDate(now), "long");
	const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

	const boostRows = [
		{
			kind: "builder" as const,
			label: text.boosts.builder,
			image: "images/season-pass/pass-items/perk-builder-boost.png",
			value: boosts.builder,
			effect: text.boosts.builderEffect(boosts.builder, formatDuration(forgeDurationMs(boosts.builder))),
		},
		{
			kind: "research" as const,
			label: text.boosts.research,
			image: "images/season-pass/pass-items/perk-research-boost.png",
			value: boosts.research,
			effect: text.boosts.researchEffect(boosts.research),
		},
	];

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, village.data.homeVillage.townHallLevel)} />
			<Card className="flex flex-col gap-3 p-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-col">
						<h2 className="text-lg font-semibold">{text.month.title(monthName)}</h2>
						<span className="text-muted text-sm">{text.month.subtitle(resetName)}</span>
					</div>
					<span className="flex items-center gap-2">
						<span className="text-muted text-sm">{text.month.key}</span>
						<Badge tone="added">{monthKey}</Badge>
					</span>
				</div>
				{rolled && (
					<Note tone="warning">
						<span className="flex flex-wrap items-center gap-3">
							<span>{text.month.rolled}</span>
							<Button onClick={actions.restoreRollover}>{text.month.undoReset}</Button>
							<Button variant="ghost" onClick={actions.acceptRollover}>
								{text.month.dismiss}
							</Button>
						</span>
					</Note>
				)}
			</Card>
			<div className="grid items-start gap-4 lg:grid-cols-2">
				<Panel title={text.boosts.title} description={text.boosts.description}>
					{boostRows.map((row) => (
						<div key={row.kind} className="flex flex-col gap-2">
							<div className="flex items-center gap-3">
								<PerkImage path={row.image} />
								<div className="flex flex-col">
									<span className="font-medium">{row.label}</span>
									<span className="text-muted text-sm">{text.boosts.value(row.value)}</span>
								</div>
							</div>
							<SegmentedControl
								label={row.label}
								value={String(row.value)}
								onChange={(value) => actions.setBoost(row.kind, Number(value) as BoostPercent)}
								options={boostOptions.map((percent) => ({ id: String(percent), label: text.boosts.option(percent) }))}
							/>
							<span className="text-sm">{row.effect}</span>
						</div>
					))}
					<p className="text-muted text-xs">
						{text.boosts.applies} {text.boosts.saved}
					</p>
				</Panel>
				<div className="flex flex-col gap-4">
					<Panel title={text.unlocks.title} description={text.unlocks.description}>
						<div className="flex items-start gap-3">
							<PerkImage path="images/other/avatar-prospector.png" />
							<div className="flex-1">
								<SwitchRow
									label={text.unlocks.prospector}
									description={`${text.unlocks.prospectorHelp}. ${text.unlocks.shows}`}
									checked={dailies.helpers.prospectorUnlocked}
									onChange={actions.setProspector}
								/>
							</div>
						</div>
					</Panel>
					<Panel title={text.perks.title} description={text.perks.description}>
						{perkRows.map(({ perk, copy, image, referenceOnly }) => (
							<div key={perk} className="flex items-start gap-3">
								<PerkImage path={image} />
								<div className="flex-1">
									<SwitchRow
										label={copy.label}
										description={
											<>
												{copy.note}
												{referenceOnly ? (
													<span className="mt-1 flex flex-wrap items-center gap-2">
														<Badge tone="warn">{text.perks.referenceOnly}</Badge>
														<span className="text-xs">{text.perks.referenceNote}</span>
													</span>
												) : (
													<span className="block text-xs">{text.perks.autoForgeEffect}</span>
												)}
											</>
										}
										checked={dailies.goldPass[perk]}
										onChange={(on) => actions.setPerk(perk, on)}
									/>
								</div>
							</div>
						))}
					</Panel>
				</div>
			</div>
		</>
	);
};

export const SeasonPassPage = () => (
	<DailiesGate id="seasonPass" title={text.title}>
		{(village) => <SeasonPassView village={village} />}
	</DailiesGate>
);
