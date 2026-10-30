import Link from "next/link";
import { formatNumber } from "@/lib/format";
import { commonText } from "@/lib/messages/common";
import { overviewText } from "@/lib/messages/overview";
import type { ProgressCardData } from "@/service/overview";
import { Card } from "@/comps/ui/Card";
import { ProgressBar } from "@/comps/ui/ProgressBar";

/** Cards that link to their page. A card that cannot apply yet is dashed and says what it needs. */
export const ProgressCards = ({
	cards,
	columns = "md:grid-cols-3 xl:grid-cols-5",
}: {
	cards: ProgressCardData[];
	columns?: string;
}) => (
	<div className={`grid grid-cols-2 gap-3 ${columns}`}>
		{cards.map((card) => (
			<Link key={card.id} href={card.href} className="block">
				<Card
					dimmed={card.lock !== undefined}
					className="hover:bg-tint flex h-full flex-col gap-1.5 px-3 py-2.5"
				>
					<span className="text-muted font-mono text-[11px] tracking-[0.08em] uppercase">
						{card.label}
					</span>
					{card.lock ? (
						<span className="text-muted text-sm">
							{overviewText.home.cards.locked(card.lock)}
						</span>
					) : (
						<>
							<span className="font-mono text-xl">{card.result.pct}%</span>
							<ProgressBar
								value={card.result.pct / 100}
								label={commonText.progressLabel(card.label)}
								tone={card.result.pct >= 100 ? "kept" : "primary"}
							/>
							<span className="text-muted text-xs">
								{formatNumber(card.result.current)} /{" "}
								{formatNumber(card.result.max)}
								{card.sub ? `, ${card.sub}` : ""}
							</span>
						</>
					)}
				</Card>
			</Link>
		))}
	</div>
);
