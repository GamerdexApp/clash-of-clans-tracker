import { formatNumber } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import { forgeRates, forgeResource, formatResourceAmount, type ForgeMode } from "@/service/forge";
import { Card } from "@/comps/ui/Card";

const text = dailiesText.forge.rates;

interface ForgeRatesProps {
	mode: ForgeMode;
	townHall: number;
	builderHall: number;
}

/** One run in a slot. Rows the village cannot forge yet are dimmed and name the hall they need. */
export const ForgeRates = ({ mode, townHall, builderHall }: ForgeRatesProps) => (
	<Card className="flex flex-col gap-3 p-4">
		<div className="flex flex-col">
			<h2 className="text-lg font-semibold">{mode === "auto" ? text.autoTitle : text.title}</h2>
			<span className="text-muted text-sm">{mode === "auto" ? text.autoDescription : text.description(townHall, builderHall)}</span>
		</div>
		<table className="w-full text-start">
			<thead>
				<tr className="text-muted text-start text-sm">
					<th scope="col" className="py-1 text-start font-medium">{text.resource}</th>
					<th scope="col" className="py-1 text-end font-medium">{text.cost}</th>
					<th scope="col" className="py-1 text-end font-medium">{text.capitalGold}</th>
				</tr>
			</thead>
			<tbody>
				{forgeRates(mode, townHall, builderHall).map((rate) => (
					<tr key={rate.type} className={`border-line border-t-[1.5px] ${rate.available ? "" : "text-muted"}`}>
						<th scope="row" className="py-2 text-start font-medium">
							{forgeResource(rate.type).label}
							{rate.requirement && <span className="block text-xs font-normal">{text.requires(rate.requirement)}</span>}
						</th>
						<td className="py-2 text-end font-mono">{rate.available ? formatResourceAmount(rate.cost) : ""}</td>
						<td className="py-2 text-end font-mono">{rate.available ? formatNumber(rate.capitalGold) : ""}</td>
					</tr>
				))}
			</tbody>
		</table>
	</Card>
);
