"use client";

import { useDailiesActions } from "@/lib/hooks/useDailiesActions";
import { formatNumber } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import { gameText } from "@/lib/messages/game";
import { dailiesOf } from "@/service/dailies";
import {
  alchemistInputMax,
  alchemistOutput,
  alchemistStats,
  helperLevel,
  levelOptions,
  type AlchemistResource,
} from "@/service/helpers";
import { SummaryTile } from "@/comps/ui/SummaryTile";
import type { Playthrough } from "@/types/app";
import { ConversionCalculator } from "./ConversionCalculator";
import { DailyTimer } from "./DailyTimer";
import { HelperShell } from "./HelperShell";
import { LevelPicker } from "./LevelPicker";

const text = dailiesText.helpers;

const resources = (): { id: AlchemistResource; label: string }[] => [
	{ id: "gold", label: gameText.resources.gold },
	{ id: "elixir", label: gameText.resources.elixir },
	{ id: "darkElixir", label: gameText.resources.darkElixir },
];

const GOLD_ELIXIR_STEP = 1_000;

export const AlchemistCard = ({ village, now }: { village: Playthrough; now: Date }) => {
	const actions = useDailiesActions(village);
	const townHall = village.data.homeVillage.townHallLevel;
	const name = text.names.alchemist;
	const level = helperLevel(village, "alchemist");
	const stats = level ? alchemistStats(level) : null;

	return (
		<HelperShell helper="alchemist" townHall={townHall}>
			<section className="flex flex-col gap-2">
				<h3 className="font-semibold">{text.dailyUse}</h3>
				<DailyTimer
					timer={dailiesOf(village).helpers.alchemist}
					now={now}
					name={name}
					onSetTime={(time) => actions.setResetTime("alchemist", time)}
					onSetTimeAndUse={(time) => actions.setResetTimeAndUse("alchemist", time, name)}
					onUse={() => actions.markHelperUsed("alchemist")}
				/>
			</section>
			<section className="flex flex-col gap-2">
				<h3 className="font-semibold">{text.level}</h3>
				<LevelPicker
					label={`${name} ${text.level}`}
					levels={levelOptions("alchemist")}
					townHall={townHall}
					value={level}
					onChange={(next) => actions.setHelperLevel("alchemist", next)}
				/>
				{stats ? (
					<div className="grid grid-cols-3 gap-2">
						<SummaryTile label={text.alchemist.stats.goldElixir} value={formatNumber(stats.goldElixirMax)} />
						<SummaryTile label={text.alchemist.stats.darkElixir} value={formatNumber(stats.darkElixirMax)} />
						<SummaryTile label={text.alchemist.stats.bonus} value={`${stats.bonusPercent}%`} />
					</div>
				) : (
					<p className="text-muted">{text.noLevel}</p>
				)}
			</section>
			{level && stats ? (
				<ConversionCalculator
					key={level}
					title={text.alchemist.calculator}
					options={resources()}
					limit={(from) => alchemistInputMax(from, level)}
					step={(from) => (from === "darkElixir" ? 1 : GOLD_ELIXIR_STEP)}
					output={(amount, from, to) => alchemistOutput(amount, from, to, level)}
					help={text.alchemist.help(stats.bonusPercent)}
				/>
			) : (
				<p className="text-muted">{text.noLevelCalculator}</p>
			)}
		</HelperShell>
	);
};
