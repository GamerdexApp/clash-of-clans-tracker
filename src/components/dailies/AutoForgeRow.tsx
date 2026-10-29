"use client";

import Image from "next/image";
import { useState } from "react";

import { formatDuration, formatNumber, formatTimeLeft } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { autoCycleEnd, forgeDurationMs, forgeResource, formatResourceAmount, type ForgeRate } from "@/service/forge";
import { Badge } from "@/comps/ui/Badge";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import type { AutoForgeData, ForgeResourceType } from "@/types/app/playthrough";
import { ResourcePicker } from "./ResourcePicker";

const text = dailiesText.forge.auto;

interface AutoForgeRowProps {
	auto: AutoForgeData;
	now: Date;
	rates: ForgeRate[];
	boost: Parameters<typeof forgeDurationMs>[0];
	onStart: (rate: ForgeRate) => void;
	onStop: () => void;
}

/** Auto Forge never shows Done. The next run starts on its own, so the row counts down the current one. */
export const AutoForgeRow = ({ auto, now, rates, boost, onStart, onStop }: AutoForgeRowProps) => {
	const [selected, setSelected] = useState<ForgeResourceType>("gold");
	const [confirming, setConfirming] = useState(false);
	const cycleEnd = autoCycleEnd(auto, now);
	const running = cycleEnd !== null;
	const rate = rates.find((candidate) => candidate.type === selected && candidate.available) ?? rates.find((candidate) => candidate.available);
	const resource = forgeResource(auto.resourceType);
	const amount = formatResourceAmount(auto.resourceAmount);
	const capitalGold = formatNumber(auto.capitalGoldOutput);
	const left = running ? cycleEnd - now.getTime() : 0;

	return (
		<li className="flex flex-col gap-3 pb-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Image
						src={toPublicImageUrl("images/season-pass/pass-items/perk-auto-forge.png")}
						alt=""
						width={28}
						height={28}
						style={{ width: 28, height: 28 }}
						className="object-contain"
					/>
					<div className="flex flex-col leading-tight">
						<h3 className="font-semibold">{text.title}</h3>
						<span className="text-muted text-xs">{text.subtitle}</span>
					</div>
				</div>
				<Badge tone={running ? "added" : "locked"}>{running ? dailiesText.forge.slots.running : dailiesText.forge.slots.idle}</Badge>
			</div>
			{running ? (
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<span>
							{text.repeats(amount, resource.label, capitalGold, formatDuration(auto.durationMs))}
						</span>
						<span className="font-mono">{dailiesText.forge.slots.left(formatTimeLeft(left))}</span>
					</div>
					<ProgressBar
						value={auto.durationMs > 0 ? 1 - left / auto.durationMs : 0}
						label={`${text.title} ${dailiesText.forge.slots.running}`}
					/>
					<p className="text-muted text-sm">{text.nextRun}</p>
					<div>
						<Button variant="danger" onClick={() => setConfirming(true)}>
							{text.stop}
						</Button>
					</div>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					<ResourcePicker rates={rates} value={rate?.type ?? selected} onChange={setSelected} />
					<div className="flex flex-wrap items-center justify-between gap-3">
						{rate && (
							<p className="text-muted">
								{dailiesText.forge.slots.rate(
									formatResourceAmount(rate.cost),
									forgeResource(rate.type).label,
									formatNumber(rate.capitalGold),
									formatDuration(forgeDurationMs(boost)),
								)}
							</p>
						)}
						<Button variant="primary" disabled={!rate} onClick={() => rate && onStart(rate)}>
							{dailiesText.forge.slots.start}
						</Button>
					</div>
				</div>
			)}
			<Dialog
				open={confirming}
				onClose={() => setConfirming(false)}
				title={text.confirm.title}
				description={text.confirm.body(amount, resource.label, capitalGold, formatTimeLeft(left))}
				footer={
					<>
						<Button onClick={() => setConfirming(false)}>{text.confirm.keep}</Button>
						<Button
							variant="danger"
							onClick={() => {
								setConfirming(false);
								onStop();
							}}
						>
							{text.confirm.stop}
						</Button>
					</>
				}
			>
				<p className="text-muted">{text.confirm.undoHint}</p>
			</Dialog>
		</li>
	);
};
