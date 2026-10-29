import Image from "next/image";

import { equipmentText } from "@/lib/messages/equipment";
import { formatNumber } from "@/lib/format";
import { isFree } from "@/service/equipment";
import type { OreAmounts as Ore } from "@/types/app/equipment";

const ICONS = {
	shiny: "/images/other/ore/shiny-ore.png",
	glowing: "/images/other/ore/glowy-ore.png",
	starry: "/images/other/ore/starry-ore.png",
} as const;
const KINDS = ["shiny", "glowing", "starry"] as const;

/** The ore a step costs: only the kinds above 0, or Free. */
export const OreAmounts = ({ ore }: { ore: Ore }) => {
	if (isFree(ore)) return <span className="text-muted">{equipmentText.card.free}</span>;
	return (
		<span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
			{KINDS.filter((kind) => ore[kind] > 0).map((kind) => (
				<span key={kind} className="flex items-center gap-1">
					<Image src={ICONS[kind]} alt="" width={16} height={16} style={{ width: 16, height: 16 }} className="shrink-0 object-contain" />
					<span className="font-mono">
						{formatNumber(ore[kind])} {equipmentText.ore.short[kind]}
					</span>
				</span>
			))}
		</span>
	);
};
