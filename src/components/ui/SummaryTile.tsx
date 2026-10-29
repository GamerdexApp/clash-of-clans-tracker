import type { ReactNode } from "react";
import { Card } from "@/comps/ui/Card";
import { SectionLabel } from "@/comps/ui/SectionLabel";

interface SummaryTileProps {
	label: string;
	value: ReactNode;
	total?: ReactNode;
	caption?: string;
	emphasis?: boolean;
}

export function SummaryTile({ label, value, total, caption, emphasis = false }: SummaryTileProps) {
	return (
		<Card className="flex flex-col gap-1 px-3 py-2.5">
			<SectionLabel className="text-muted">{label}</SectionLabel>
			<span className="flex items-baseline gap-1.5">
				<span className={`font-mono text-xl ${emphasis ? "text-primary" : "text-ink"}`}>
					{value}
				</span>
				{total !== undefined && (
					<span className="text-muted font-mono text-sm">/ {total}</span>
				)}
			</span>
			{caption && <span className="text-muted text-xs">{caption}</span>}
		</Card>
	);
}
