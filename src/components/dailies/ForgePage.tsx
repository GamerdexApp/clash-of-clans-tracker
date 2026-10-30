"use client";

import Image from "next/image";

import { useNow } from "@/lib/hooks/useNow";
import { useDailiesActions } from "@/lib/hooks/useDailiesActions";
import { formatDuration } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { dailiesOf } from "@/service/dailies";
import {
  FORGE_SLOT_COUNT,
  autoForgeOpen,
  dailyCapitalGold,
  forgeBoost,
  forgeDurationMs,
  forgeRates,
  forgeSlots,
  openSlotCount,
  slotTownHall,
} from "@/service/forge";
import { PageHeader } from "@/comps/shell/PageHeader";
import { Badge } from "@/comps/ui/Badge";
import { Card } from "@/comps/ui/Card";
import type { Playthrough } from "@/types/app";
import { AutoForgeRow } from "./AutoForgeRow";
import { DailiesGate } from "./DailiesGate";
import { DailyTimer } from "./DailyTimer";
import { ForgeRates } from "./ForgeRates";
import { ForgeRunRow } from "./ForgeRunRow";

const text = dailiesText.forge;

const ForgeView = ({ village }: { village: Playthrough }) => {
	const now = new Date(useNow());
	const actions = useDailiesActions(village);
	const dailies = dailiesOf(village);
	const townHall = village.data.homeVillage.townHallLevel;
	const builderHall = village.data.builderBase.builderHallLevel;
	const boost = forgeBoost(village, now);
	const open = openSlotCount(townHall);
	const dailyGold = dailyCapitalGold(townHall);
	const slots = forgeSlots(village);

	return (
		<>
			<PageHeader title={text.title} subline={text.subline(village.name, townHall, builderHall)} />
			<div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<div className="flex flex-col gap-4">
					<Card className="flex flex-col gap-3 p-4">
						<div className="flex items-center gap-3">
							<Image
								src={toPublicImageUrl("images/other/gold-c.png")}
								alt=""
								width={40}
								height={40}
								style={{ width: 40, height: 40 }}
								className="shrink-0 object-contain"
							/>
							<div className="flex flex-col">
								<h2 className="text-lg font-semibold">{text.daily.title}</h2>
								<span className="text-muted">{dailyGold > 0 ? text.daily.amount(dailyGold, townHall) : text.daily.none}</span>
							</div>
						</div>
						<DailyTimer
							timer={dailies.capitalGold}
							now={now}
							name={text.daily.name}
							onSetTime={(time) => actions.setResetTime("capitalGold", time)}
							onSetTimeAndUse={(time) => actions.setResetTimeAndUse("capitalGold", time, text.daily.name)}
							onUse={() => actions.markTimerUsed("capitalGold", text.daily.name)}
						/>
					</Card>
					<Card className="flex flex-col gap-3 p-4">
						<div className="flex flex-col">
							<h2 className="text-lg font-semibold">{text.slots.title}</h2>
							<span className="text-muted text-sm">
								{text.slots.craftingTime}, {text.slots.open(open, FORGE_SLOT_COUNT, townHall)}
							</span>
							{boost > 0 && <span className="text-muted text-sm">{text.slots.boost(boost, formatDuration(forgeDurationMs(boost)))}</span>}
						</div>
						<ul className="flex flex-col">
							{autoForgeOpen(village) && (
								<AutoForgeRow
									auto={dailies.autoForge}
									now={now}
									rates={forgeRates("auto", townHall, builderHall)}
									boost={boost}
									onStart={actions.startAuto}
									onStop={actions.stopAuto}
								/>
							)}
							{slots.map((slot, index) =>
								index < open ? (
									<ForgeRunRow
										key={index}
										label={text.slots.slot(index + 1)}
										slot={slot}
										now={now}
										rates={forgeRates("manual", townHall, builderHall)}
										boost={boost}
										onStart={(rate) => actions.startSlot(index, rate)}
										onStop={() => actions.stopSlot(index)}
										onReset={() => actions.resetSlot(index)}
									/>
								) : (
									<li
										key={index}
										className="border-line text-muted flex flex-wrap items-center justify-between gap-2 border-t-[1.5px] py-3 first:border-t-0"
									>
										<span className="font-semibold">{text.slots.slot(index + 1)}</span>
										<span className="flex items-center gap-2">
											{text.slots.requires(slotTownHall(index + 1)!)}
											<Badge tone="locked">{text.slots.locked}</Badge>
										</span>
									</li>
								),
							)}
						</ul>
					</Card>
				</div>
				<div className="flex flex-col gap-4">
					<ForgeRates mode="manual" townHall={townHall} builderHall={builderHall} />
					{autoForgeOpen(village) && <ForgeRates mode="auto" townHall={townHall} builderHall={builderHall} />}
				</div>
			</div>
		</>
	);
};

export const ForgePage = () => (
	<DailiesGate id="forge" title={text.title}>
		{(village) => <ForgeView village={village} />}
	</DailiesGate>
);
