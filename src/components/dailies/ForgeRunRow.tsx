"use client";

import Image from "next/image";
import { useState } from "react";

import { formatDuration, formatNumber, formatTimeLeft } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import {
  forgeDurationMs,
  forgeResource,
  formatResourceAmount,
  slotState,
  type ForgeRate,
} from "@/service/forge";
import { Badge } from "@/comps/ui/Badge";
import { Button } from "@/comps/ui/Button";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import type { ForgeResourceType, ForgeSlotData } from "@/types/app/playthrough";
import { ResourcePicker } from "./ResourcePicker";

const text = dailiesText.forge.slots;

const ResourceMark = ({ type }: { type: ForgeResourceType }) => (
	<Image
		src={toPublicImageUrl(forgeResource(type).image)}
		alt=""
		width={28}
		height={28}
		style={{ width: 28, height: 28 }}
		className="shrink-0 object-contain"
	/>
);

interface IdleSlotProps {
	rates: ForgeRate[];
	boost: Parameters<typeof forgeDurationMs>[0];
	onStart: (rate: ForgeRate) => void;
}

const IdleSlot = ({ rates, boost, onStart }: IdleSlotProps) => {
	const [selected, setSelected] = useState<ForgeResourceType>("gold");
	const rate = rates.find((candidate) => candidate.type === selected && candidate.available) ?? rates.find((candidate) => candidate.available);
	return (
		<div className="flex flex-col gap-3">
			<ResourcePicker rates={rates} value={rate?.type ?? selected} onChange={setSelected} />
			<div className="flex flex-wrap items-center justify-between gap-3">
				{rate && (
					<p className="text-muted">
						{text.rate(
							formatResourceAmount(rate.cost),
							forgeResource(rate.type).label,
							formatNumber(rate.capitalGold),
							formatDuration(forgeDurationMs(boost)),
						)}
					</p>
				)}
				<Button variant="primary" disabled={!rate} onClick={() => rate && onStart(rate)}>
					{text.start}
				</Button>
			</div>
		</div>
	);
};

interface ForgeRunRowProps {
	label: string;
	slot: ForgeSlotData;
	now: Date;
	rates: ForgeRate[];
	boost: Parameters<typeof forgeDurationMs>[0];
	onStart: (rate: ForgeRate) => void;
	onStop: () => void;
	onReset: () => void;
}

/** One forge slot: choose a resource, watch the run and reset it once it is done. */
export const ForgeRunRow = ({ label, slot, now, rates, boost, onStart, onStop, onReset }: ForgeRunRowProps) => {
	const state = slotState(slot, now);
	const resourceType = slot.resourceType ?? "gold";
	const endsAt = slot.endsAt ? Date.parse(slot.endsAt) : 0;
	const left = Math.max(0, endsAt - now.getTime());

	return (
		<li className="border-line flex flex-col gap-3 border-t-[1.5px] py-3 first:border-t-0 first:pt-0 last:pb-0">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					{state !== "idle" && <ResourceMark type={resourceType} />}
					<h3 className="font-semibold">
						{state === "idle" ? label : `${label}, ${forgeResource(resourceType).label}, ${formatResourceAmount(slot.resourceCost)}`}
					</h3>
				</div>
				<Badge tone={state === "idle" ? "locked" : state === "done" ? "kept" : "added"}>
					{state === "idle" ? text.idle : state === "done" ? text.done : text.running}
				</Badge>
			</div>
			{state === "idle" && <IdleSlot rates={rates} boost={boost} onStart={onStart} />}
			{state === "running" && (
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<span className="text-muted">
							{text.result}: {formatNumber(slot.capitalGoldOutput)} Capital Gold
						</span>
						<span className="font-mono">{text.left(formatTimeLeft(left))}</span>
					</div>
					<ProgressBar
						value={slot.durationMs > 0 ? 1 - left / slot.durationMs : 0}
						label={`${label} ${text.running}`}
						tone="primary"
					/>
					<div>
						<Button onClick={onStop}>{text.stop}</Button>
					</div>
				</div>
			)}
			{state === "done" && (
				<div className="flex flex-wrap items-center justify-between gap-3">
					<p>
						{text.ready(formatNumber(slot.capitalGoldOutput))} {text.finished(formatDuration(now.getTime() - endsAt))}
					</p>
					<Button variant="primary" onClick={onReset}>
						{text.reset}
					</Button>
				</div>
			)}
		</li>
	);
};
