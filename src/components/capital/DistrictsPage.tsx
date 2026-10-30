"use client";

import { Suspense, useState } from "react";

import { formatNumber } from "@/lib/format";
import { useCapitalActions } from "@/lib/hooks/useCapitalActions";
import { capitalText } from "@/lib/messages/capital";
import {
  capitalHallCost,
  capitalHallOf,
  capitalZones,
  maxCapitalHall,
  zoneHall,
  zoneIsOpen,
  zoneOpensAt,
  zoneProgress,
  zoneUnlockLevel,
  type HallChange,
} from "@/service/capital";
import { PageHeader } from "@/comps/shell/PageHeader";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Dialog } from "@/comps/ui/Dialog";
import { Field } from "@/comps/ui/Field";
import { CommitNumberInput } from "@/comps/ui/CommitNumberInput";
import { Select } from "@/comps/ui/Select";
import { SummaryTile } from "@/comps/ui/SummaryTile";
import { SwitchRow } from "@/comps/ui/Switch";
import type { Playthrough } from "@/types/app";
import type { ZoneId } from "@/types/app/capital";
import { CapitalGate } from "./CapitalGate";
import { HallChangeDialog } from "./HallChangeDialog";
import { ZonePanel } from "./ZonePanel";

const text = capitalText;

interface PendingHall {
	zoneId: ZoneId;
	level: number;
	change: HallChange;
}

const percent = (current: number, max: number) => (max === 0 ? 0 : Math.floor((current / max) * 100));

const DistrictsContent = ({ village }: { village: Playthrough }) => {
	const actions = useCapitalActions(village);
	const [zoneId, setZoneId] = useState<ZoneId>("capitalPeak");
	const [pending, setPending] = useState<PendingHall | null>(null);
	const [confirmOff, setConfirmOff] = useState(false);

	const capitalHall = capitalHallOf(village);
	const zones = capitalZones.map((zone) => ({
		...zone,
		open: zoneIsOpen(village, zone.id),
		hall: zoneHall(village, zone.id),
		progress: zoneProgress(village, zone.id),
	}));
	const total = zones.filter((zone) => zone.open).reduce(
		(sum, zone) => ({ current: sum.current + zone.progress.current, max: sum.max + zone.progress.max }),
		{ current: 0, max: 0 },
	);
	const openZones = zones.filter((zone) => zone.open && (zone.id === "capitalPeak" ? capitalHall > 0 : true)).length;
	const selected = zones.find((zone) => zone.id === zoneId && zone.open) ?? zones[0];

	const requestHall = (id: ZoneId, level: number) => {
		const change = actions.previewHall(id, level);
		if (change.resets.length > 0) setPending({ zoneId: id, level, change });
		else actions.changeHall(id, level);
	};

	const nextCapitalHall = capitalHall + 1;

	return (
		<>
			<PageHeader
				title={text.districts.title}
				subline={text.districts.subline(village.name, capitalHall)}
				actions={
					<SwitchRow
						label={text.tracking.label}
						checked
						onChange={(on) => !on && setConfirmOff(true)}
					/>
				}
			/>
			<Card className="flex flex-col gap-4 p-4">
				<div className="flex flex-wrap items-end gap-4">
					<Field label={text.hall.label}>
						<Select value={capitalHall} onChange={(event) => requestHall("capitalPeak", Number(event.target.value))}>
							<option value={0}>{text.hall.none}</option>
							{Array.from({ length: maxCapitalHall }, (_, index) => index + 1).map((level) => (
								<option key={level} value={level}>
									{text.hall.level(level)}
								</option>
							))}
						</Select>
					</Field>
					<Field label={text.contributions.label} hint={text.contributions.help}>
						<span className="flex items-center gap-2">
							<CommitNumberInput
								aria-label={text.contributions.label}
								value={village.data.clanCapital.clanCapitalContributions}
								onCommit={actions.setContributions}
								className="w-40 font-mono"
							/>
							<span className="text-muted whitespace-nowrap">{text.contributions.unit}</span>
						</span>
					</Field>
				</div>
				<p className="text-muted">
					{nextCapitalHall <= maxCapitalHall
						? text.hall.nextCost(nextCapitalHall, formatNumber(capitalHallCost(nextCapitalHall)), zoneOpensAt(nextCapitalHall))
						: text.hall.atTop}
				</p>
			</Card>
			{capitalHall === 0 ? (
				<Card className="flex flex-col gap-1 p-4">
					<h2 className="text-base font-semibold">{text.notSet.title}</h2>
					<p className="text-muted">{text.notSet.description}</p>
				</Card>
			) : (
				<>
					<div className="grid gap-3 sm:grid-cols-2">
						<SummaryTile
							label={text.tiles.progress}
							value={`${percent(total.current, total.max)}%`}
							caption={text.tiles.progressCaption(total.current, total.max)}
						/>
						<SummaryTile
							label={text.tiles.zones}
							value={openZones}
							total={zones.length}
							caption={text.tiles.zonesCaption(openZones, zones.length)}
						/>
					</div>
					<section aria-labelledby="capital-zones" className="flex flex-col gap-3">
						<div className="flex flex-col">
							<h2 id="capital-zones" className="text-lg font-semibold">{text.zones.title}</h2>
							<span className="text-muted text-sm">{text.zones.help}</span>
						</div>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{zones.map((zone) => (
								<button
									key={zone.id}
									type="button"
									disabled={!zone.open}
									aria-pressed={selected.id === zone.id}
									onClick={() => setZoneId(zone.id)}
									className={`flex min-h-11 flex-col gap-1 rounded-md border-[1.5px] p-3 text-start disabled:opacity-60 ${
										selected.id === zone.id ? "border-primary bg-tint" : "border-line bg-surface"
									}`}
								>
									<span className="flex items-center justify-between gap-2">
										<span className="font-semibold">{zone.label}</span>
										{zone.open && <span className="font-mono text-sm">{percent(zone.progress.current, zone.progress.max)}%</span>}
									</span>
									<span className="text-muted text-xs">
										{zone.open
											? zone.id === "capitalPeak"
												? text.zones.peakHall(zone.hall)
												: text.zones.hall(zone.hall)
											: text.zones.locked(zoneUnlockLevel(zone.id))}
									</span>
									{zone.open && (
										<span className="text-muted font-mono text-xs">
											{text.zones.levels(zone.progress.current, zone.progress.max)}
										</span>
									)}
								</button>
							))}
						</div>
					</section>
					<ZonePanel
						key={selected.id}
						village={village}
						zoneId={selected.id}
						actions={actions}
						onDistrictHall={requestHall}
					/>
				</>
			)}
			<HallChangeDialog
				change={pending?.change ?? null}
				onClose={() => setPending(null)}
				onConfirm={() => {
					if (pending) actions.changeHall(pending.zoneId, pending.level);
					setPending(null);
				}}
			/>
			<Dialog
				open={confirmOff}
				onClose={() => setConfirmOff(false)}
				title={text.tracking.offDialog.title}
				description={text.tracking.offDialog.body}
				footer={
					<>
						<Button onClick={() => setConfirmOff(false)}>{text.tracking.offDialog.cancel}</Button>
						<Button
							variant="primary"
							onClick={() => {
								actions.setTracking(false);
								setConfirmOff(false);
							}}
						>
							{text.tracking.offDialog.confirm}
						</Button>
					</>
				}
			>
				<p className="text-muted">{text.tracking.onHelp}</p>
			</Dialog>
		</>
	);
};

export const DistrictsPage = () => (
	<Suspense fallback={null}>
		<CapitalGate title={text.districts.title}>{(village) => <DistrictsContent village={village} />}</CapitalGate>
	</Suspense>
);
