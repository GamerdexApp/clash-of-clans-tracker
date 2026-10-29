"use client";

import Image from "next/image";

import { getCraftedDefenses } from "@/lib/utils/massEditHelpers";
import type { TabProps } from "@/types/components/builder";
import { Card } from "@/comps/ui/Card";
import { Masonry } from "@/comps/ui/Masonry";
import { TargetRow } from "./TargetRow";

export const CraftedTab = ({ village, hideMax: _hideMax, ...handlers }: TabProps) => (
	<Masonry>
		{getCraftedDefenses().map((defense) => (
			<Card key={defense.id} role="group" aria-label={defense.name} className="flex flex-col gap-3 p-4">
				<div className="flex items-center gap-3">
					{defense.imageUrl && (
						<Image
							src={defense.imageUrl}
							alt=""
							width={48}
							height={48}
							style={{ width: 48, height: 48 }}
							className="shrink-0 object-contain"
						/>
					)}
					<h3 className="truncate text-base font-semibold">{defense.name}</h3>
				</div>
				<ul className="flex flex-col gap-2">
					{defense.modules.map((module, moduleIndex) => (
						<TargetRow
							key={moduleIndex}
							village={village}
							target={{ kind: "crafted", defenseId: defense.id, moduleIndex }}
							name={`${defense.name}, ${module.name}`}
							maxLevel={module.maxLevel}
							hideStepperAtZero={false}
							prefix={<span className="text-muted text-xs">{module.name}</span>}
							{...handlers}
						/>
					))}
				</ul>
			</Card>
		))}
	</Masonry>
);
