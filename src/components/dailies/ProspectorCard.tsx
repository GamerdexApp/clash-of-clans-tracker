"use client";

import { useDailiesActions } from "@/lib/hooks/useDailiesActions";
import { formatNumber } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import { dailiesOf } from "@/service/dailies";
import { oreInputMax, oreOrder, oreOutput } from "@/service/helpers";
import { Badge } from "@/comps/ui/Badge";
import { ButtonLink } from "@/comps/ui/Button";
import { SummaryTile } from "@/comps/ui/SummaryTile";
import type { Playthrough } from "@/types/app";
import { ConversionCalculator } from "./ConversionCalculator";
import { DailyTimer } from "./DailyTimer";
import { HelperShell } from "./HelperShell";

const text = dailiesText.helpers;

const ores = () => oreOrder.map((id) => ({ id, label: text.prospector.ores[id] }));

export const ProspectorCard = ({ village, now }: { village: Playthrough; now: Date }) => {
	const actions = useDailiesActions(village);
	const dailies = dailiesOf(village);
	const unlocked = dailies.helpers.prospectorUnlocked;
	const name = text.names.prospector;

	return (
		<HelperShell
			helper="prospector"
			townHall={village.data.homeVillage.townHallLevel}
			subline={text.prospector.subtitle}
			badge={<Badge tone={unlocked ? "kept" : "locked"}>{unlocked ? text.prospector.unlockedBadge : text.prospector.lockedBadge}</Badge>}
		>
			{unlocked ? (
				<>
					<section className="flex flex-col gap-2">
						<h3 className="font-semibold">{text.dailyUse}</h3>
						<DailyTimer
							timer={dailies.helpers.prospector}
							now={now}
							name={name}
							onSetTime={(time) => actions.setResetTime("prospector", time)}
							onSetTimeAndUse={(time) => actions.setResetTimeAndUse("prospector", time, name)}
							onUse={() => actions.markHelperUsed("prospector")}
						/>
					</section>
					<section className="flex flex-col gap-2">
						<h3 className="font-semibold">{text.level}</h3>
						<p className="text-muted">{text.prospector.levelOnly}</p>
						<div className="grid grid-cols-3 gap-2">
							{oreOrder.map((ore) => (
								<SummaryTile key={ore} label={text.prospector.limits[ore]} value={formatNumber(oreInputMax(ore))} />
							))}
						</div>
					</section>
					<ConversionCalculator
						title={text.prospector.calculator}
						options={ores()}
						limit={oreInputMax}
						step={() => 1}
						output={oreOutput}
						help={text.prospector.help}
					/>
				</>
			) : (
				<div className="flex flex-col gap-2">
					<p className="font-medium">{text.prospector.lockedTitle}</p>
					<p className="text-muted">{text.prospector.lockedHelp}</p>
					<div>
						<ButtonLink href="/season-pass">{text.prospector.toSeasonPass}</ButtonLink>
					</div>
				</div>
			)}
		</HelperShell>
	);
};
