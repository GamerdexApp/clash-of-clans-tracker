"use client";

import Image from "next/image";
import { useState } from "react";
import { LuClock, LuLock } from "react-icons/lu";
import { overviewText } from "@/lib/messages/overview";
import type { ItemTileData } from "@/service/overview";

interface ItemTileProps {
	item: ItemTileData;
	size?: "normal" | "small";
}

/** An icon with its level. Green outline at the maximum, dashed when locked, a clock while an upgrade runs. */
export const ItemTile = ({ item, size = "normal" }: ItemTileProps) => {
	const [broken, setBroken] = useState(false);
	const label = overviewText.home.tile(item.name, item.level, item.maxLevel, item.requirement);
	const dimension = size === "small" ? 40 : 52;
	return (
		<span
			role="img"
			aria-label={label}
			title={label}
			style={{ width: dimension, height: dimension }}
			className={`bg-surface relative shrink-0 overflow-hidden rounded-md border-[1.5px] ${
				item.locked
					? "border-line border-dashed opacity-60 grayscale"
					: item.maxed
						? "border-kept"
						: "border-line"
			}`}
		>
			{item.imageUrl && !broken ? (
				<Image
					src={item.imageUrl}
					alt=""
					fill
					sizes={`${dimension}px`}
					className="object-contain p-0.5"
					onError={() => setBroken(true)}
				/>
			) : (
				<span className="text-muted flex size-full items-center justify-center text-xs font-bold">
					{item.name.slice(0, 2).toUpperCase()}
				</span>
			)}
			<span
				className={`absolute start-0 bottom-0 min-w-5 rounded-tr-md px-1 text-center font-mono text-[11px] leading-4 font-semibold ${
					item.maxed ? "bg-kept text-on-primary" : "bg-primary text-on-primary"
				}`}
			>
				{item.locked ? (
					<LuLock aria-hidden="true" size={11} className="mx-auto my-[2.5px]" />
				) : (
					item.level
				)}
			</span>
			{item.upgrading && (
				<LuClock
					aria-hidden="true"
					size={12}
					className="text-primary absolute end-0.5 top-0.5"
				/>
			)}
		</span>
	);
};
