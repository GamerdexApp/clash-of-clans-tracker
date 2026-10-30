"use client";

import { builderBaseText } from "@/lib/messages/builderBase";
import { clockTowerImageUrl, clockTowerMaxLevel } from "@/service/builderBaseSteps";
import { readLevel } from "@/service/upgradeEngine";
import { Masonry } from "@/comps/ui/Masonry";
import { ItemCard } from "@/comps/upgrades/ItemCard";
import type { UpgradeTarget } from "@/types/app/engine";
import type { TabProps } from "@/types/components/builder";
import { BuilderHallTile } from "./BuilderHallTile";

const text = builderBaseText.other;
const CLOCK_TOWER: UpgradeTarget = { kind: "clockTower" };

/** The Builder Hall and the Clock Tower. Both are upgrades with a timer, like the Town Hall tab at home. */
export const BuilderBaseOtherTab = ({ village, hideMax: _hideMax, now, ...handlers }: TabProps) => {
	const maxLevel = clockTowerMaxLevel(village.data.builderBase.builderHallLevel);

	return (
		<Masonry>
			<BuilderHallTile village={village} now={now} handlers={handlers} />
			{maxLevel > 0 && (
				<ItemCard
					village={village}
					target={CLOCK_TOWER}
					name={text.clockTower}
					maxLevel={maxLevel}
					imageUrl={clockTowerImageUrl(readLevel(village, CLOCK_TOWER))}
					maxLabel={text.clockTowerMax(maxLevel)}
					progressLabel={text.clockTowerProgress}
					now={now}
					hideStepperAtZero={false}
					{...handlers}
				/>
			)}
		</Masonry>
	);
};
