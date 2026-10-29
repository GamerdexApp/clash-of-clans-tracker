"use client";

import Image from "next/image";
import { Suspense } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useCapitalActions } from "@/lib/hooks/useCapitalActions";
import { capitalText } from "@/lib/messages/capital";
import { capitalArmy } from "@/service/capital";
import { PageHeader } from "@/comps/shell/PageHeader";
import { Card } from "@/comps/ui/Card";
import { EmptyState } from "@/comps/ui/EmptyState";
import { NumberStepper } from "@/comps/ui/NumberStepper";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import { SummaryTile } from "@/comps/ui/SummaryTile";
import { HideMaxToggle } from "@/comps/upgrades/HideMaxToggle";
import type { Playthrough } from "@/types/app";
import type { CapitalArmyEntry } from "@/types/app/capital";
import { CapitalGate } from "./CapitalGate";

const text = capitalText.troops;

const requirementText = (entry: CapitalArmyEntry) => {
	const { requirement } = entry;
	if (!requirement) return "";
	return requirement.capitalHall !== null
		? text.locked.capitalHall(requirement.capitalHall, requirement.zone)
		: text.locked.districtHall(requirement.districtHall, requirement.zone);
};

const ArmyCard = ({ entry, onChange }: { entry: CapitalArmyEntry; onChange: (level: number) => void }) => {
	const locked = entry.maxLevel === 0;
	return (
		<Card dimmed={locked} role="group" aria-label={entry.name} className="flex flex-col gap-3 p-4">
			<div className="flex items-start gap-3">
				{entry.imageUrl && (
					<Image
						src={entry.imageUrl}
						alt=""
						width={48}
						height={48}
						style={{ width: 48, height: 48 }}
						className={`shrink-0 object-contain ${locked ? "opacity-60" : ""}`}
					/>
				)}
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<h3 className="truncate text-base font-semibold">{entry.name}</h3>
					{entry.district && <span className="text-muted text-xs">{text.card.from(entry.district)}</span>}
					{locked ? (
						<>
							<span className="text-muted text-xs">{requirementText(entry)}</span>
							{entry.level > 0 && <span className="text-muted text-xs">{text.locked.kept(entry.level)}</span>}
						</>
					) : (
						<>
							<span className="text-muted text-xs">{text.card.maxAt(entry.maxLevel)}</span>
							<ProgressBar value={Math.min(1, entry.level / entry.maxLevel)} label={text.card.progress(entry.name)} tone="kept" />
						</>
					)}
				</div>
			</div>
			{!locked && (
				<NumberStepper
					value={entry.level}
					min={0}
					max={entry.maxLevel}
					step={1}
					label={text.card.level(entry.name)}
					raiseLabel={text.card.raise(entry.name)}
					lowerLabel={text.card.lower(entry.name)}
					onChange={onChange}
				/>
			)}
		</Card>
	);
};

const Section = ({
	id,
	title,
	entries,
	onChange,
}: {
	id: string;
	title: string;
	entries: CapitalArmyEntry[];
	onChange: (entry: CapitalArmyEntry, level: number) => void;
}) => (
	<section aria-labelledby={id} className="flex flex-col gap-3">
		<h2 id={id} className="text-lg font-semibold">
			{title}
		</h2>
		<div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{entries.map((entry) => (
				<ArmyCard key={entry.name} entry={entry} onChange={(level) => onChange(entry, level)} />
			))}
		</div>
	</section>
);

const TroopsContent = ({ village }: { village: Playthrough }) => {
	const { appSettings, updateSettings } = usePlaythrough();
	const actions = useCapitalActions(village);
	const hideMax = appSettings.ui?.hideMax ?? false;
	const army = capitalArmy(village);

	const progress = (kind: CapitalArmyEntry["kind"]) =>
		army
			.filter((entry) => entry.kind === kind)
			.reduce((sum, entry) => ({ current: sum.current + entry.level, max: sum.max + entry.topLevel }), { current: 0, max: 0 });
	const troops = progress("troops");
	const spells = progress("spells");

	const shown = (kind: CapitalArmyEntry["kind"]) =>
		army.filter((entry) => entry.kind === kind && !(hideMax && entry.maxLevel > 0 && entry.level >= entry.maxLevel));
	const shownTroops = shown("troops");
	const shownSpells = shown("spells");
	const change = (entry: CapitalArmyEntry, level: number) => actions.setArmy(entry.kind, entry.name, level);

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name)} />
			<div className="grid gap-3 sm:grid-cols-2">
				<SummaryTile label={text.tiles.troops} value={troops.current} total={troops.max} caption={text.tiles.caption(troops.current, troops.max)} />
				<SummaryTile label={text.tiles.spells} value={spells.current} total={spells.max} caption={text.tiles.caption(spells.current, spells.max)} />
			</div>
			<div className="max-w-sm">
				<HideMaxToggle checked={hideMax} onChange={(checked) => updateSettings({ ui: { ...appSettings.ui, hideMax: checked } })} />
			</div>
			{shownTroops.length + shownSpells.length === 0 ? (
				<EmptyState title={text.empty.title} description={text.empty.description} />
			) : (
				<>
					{shownTroops.length > 0 && <Section id="capital-troops" title={text.sections.troops} entries={shownTroops} onChange={change} />}
					{shownSpells.length > 0 && <Section id="capital-spells" title={text.sections.spells} entries={shownSpells} onChange={change} />}
				</>
			)}
		</>
	);
};

export const CapitalTroopsPage = () => (
	<Suspense fallback={null}>
		<CapitalGate title={text.title}>{(village) => <TroopsContent village={village} />}</CapitalGate>
	</Suspense>
);
