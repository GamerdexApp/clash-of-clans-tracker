"use client";

import Image from "next/image";
import type { TabProps } from "@/types/components/builder";
import { commonText } from "@/lib/messages/common";
import { calcSuperchargeProgress } from "@/lib/utils/progressHelpers";
import { getTownHallImageUrl, getTownHallMaxLevel, getTownHallWeaponInfo } from "@/lib/utils/upgradeHelpers";
import { Card } from "@/comps/ui/Card";
import { Masonry } from "@/comps/ui/Masonry";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import { TargetRow } from "./TargetRow";

export const TownHallTab = ({ village, hideMax: _hideMax, ...handlers }: TabProps) => {
	const hv = village.data.homeVillage;
	const weapon = getTownHallWeaponInfo(hv.townHallLevel);
	const supercharge = calcSuperchargeProgress(hv, hv.townHallLevel);

	return (
		<Masonry>
			<Card className="flex flex-col gap-3 p-4">
				<div className="flex items-center gap-3">
					<Image
						src={getTownHallImageUrl(hv.townHallLevel)}
						alt=""
						width={64}
						height={64}
						style={{ width: 64, height: 64 }}
						className="shrink-0 object-contain"
					/>
					<h3 className="text-base font-semibold">{commonText.townHallTab.title}</h3>
				</div>
				<ul>
					<TargetRow
						village={village}
						target={{ kind: "townHall" }}
						name="Town Hall"
						maxLevel={getTownHallMaxLevel()}
						hideStepperAtZero={false}
						{...handlers}
					/>
				</ul>
				{weapon && (
					<>
						<h3 className="border-line border-t-[1.5px] pt-3 text-base font-semibold">{weapon.name}</h3>
						<ul>
							<TargetRow
								village={village}
								target={{ kind: "townHallWeapon" }}
								name={weapon.name}
								maxLevel={weapon.maxLevel}
								hideStepperAtZero={false}
								{...handlers}
							/>
						</ul>
					</>
				)}
			</Card>
			{supercharge.max > 0 && (
				<Card className="flex flex-col gap-2 p-4">
					<h3 className="text-base font-semibold">
						{commonText.townHallTab.supercharge}
					</h3>
					<p className="text-muted">
						{commonText.townHallTab.superchargeDone(
							supercharge.current,
							supercharge.max
						)}
					</p>
					<ProgressBar
						value={supercharge.pct / 100}
						label={commonText.townHallTab.superchargeProgress}
						tone="kept"
					/>
					<span className="font-mono text-xs">{supercharge.pct}%</span>
				</Card>
			)}
		</Masonry>
	);
};
