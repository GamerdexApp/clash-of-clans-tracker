"use client";

import { formatNumber } from "@/lib/format";
import { equipmentText } from "@/lib/messages/equipment";
import { oreShortage } from "@/service/equipment";
import { Card } from "@/comps/ui/Card";
import { Field } from "@/comps/ui/Field";
import { NumberInput } from "@/comps/ui/NumberInput";
import { SwitchRow } from "@/comps/ui/Switch";
import type { OreStockCardProps } from "@/types/components/equipment";

const text = equipmentText.ore;
const KINDS = ["shiny", "glowing", "starry"] as const;

export const OreStockCard = ({ stock, needed, deduct, onStockChange, onDeductChange }: OreStockCardProps) => {
	const short = oreShortage(stock, needed);

	return (
		<Card className="flex flex-col gap-3 p-4">
			<div className="flex flex-col gap-0.5">
				<h2 className="text-base font-semibold">{text.title}</h2>
				<p className="text-muted">{text.description}</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-3">
				{KINDS.map((kind) => (
					<div key={kind} className="flex flex-col gap-1">
						<Field label={text.names[kind]}>
							<NumberInput
								value={stock[kind]}
								min={0}
								aria-label={text.names[kind]}
								onChange={(value) => onStockChange({ ...stock, [kind]: Math.floor(value) })}
							/>
						</Field>
						<span className="text-muted text-xs">{text.needed(formatNumber(needed[kind]))}</span>
						<span className={`text-xs font-medium ${short[kind] > 0 ? "text-danger" : "text-kept"}`}>
							{short[kind] > 0 ? text.shortBy(formatNumber(short[kind])) : text.enough}
						</span>
					</div>
				))}
			</div>
			<SwitchRow label={text.deduct} description={text.deductHelp} checked={deduct} onChange={onDeductChange} />
		</Card>
	);
};
