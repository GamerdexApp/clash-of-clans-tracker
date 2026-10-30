import { syncText } from "@/lib/messages/sync";
import { Card } from "@/comps/ui/Card";

export const HowSyncWorks = () => (
	<Card className="flex flex-col gap-3 p-4">
		<h2 className="text-base font-semibold">{syncText.how.title}</h2>
		<ul className="flex flex-col gap-3">
			{syncText.how.points.map((point) => (
				<li key={point} className="flex items-start gap-3">
					<span aria-hidden="true" className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
					<span>{point}</span>
				</li>
			))}
		</ul>
	</Card>
);
