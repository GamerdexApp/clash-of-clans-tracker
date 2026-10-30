"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { readLevel } from "@/service/upgradeEngine";
import { Card } from "@/comps/ui/Card";
import { ProgressBar } from "@/comps/ui/ProgressBar";
import { TargetRow } from "@/comps/builder/TargetRow";
import type { TargetRowProps } from "@/types/components/builder";

interface ItemCardProps extends TargetRowProps {
	imageUrl: string;
	maxLabel: string;
	progressLabel: string;
	/** Text under the name, such as the Town Hall and Pet House a pet needs. */
	detail?: ReactNode;
}

/** A troop, spell, siege machine or pet: its picture, progress and one upgrade row. */
export const ItemCard = ({ imageUrl, maxLabel, progressLabel, detail, ...row }: ItemCardProps) => (
	<Card role="group" aria-label={row.name} className="flex flex-col gap-3 p-4">
		<div className="flex items-start gap-3">
			{imageUrl && (
				<Image
					src={imageUrl}
					alt=""
					width={48}
					height={48}
					style={{ width: 48, height: 48 }}
					className="shrink-0 object-contain"
				/>
			)}
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<h3 className="truncate text-base font-semibold">{row.name}</h3>
				<span className="text-muted text-xs">{maxLabel}</span>
				{detail}
				<ProgressBar
					value={Math.min(1, readLevel(row.village, row.target) / row.maxLevel)}
					label={progressLabel}
					tone="kept"
				/>
			</div>
		</div>
		<ul>
			<TargetRow {...row} />
		</ul>
	</Card>
);
