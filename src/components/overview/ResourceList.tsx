import Image from "next/image";
import { formatNumber } from "@/lib/format";
import type { ResourceRow } from "@/service/overview";

/** Production per hour and storage of the built collectors and storages, in two short columns. */
export const ResourceList = ({ rows }: { rows: ResourceRow[] }) =>
	rows.length === 0 ? null : (
		<div className="flex gap-4 text-sm">
			{(["perHour", "storage"] as const).map((field) => (
				<ul key={field} className="flex flex-col gap-0.5">
					{rows
						.filter((row) => row[field] > 0)
						.map((row) => (
							<li key={row.id} className="flex items-center gap-1.5">
								<Image
									src={row.image}
									alt={row.label}
									width={14}
									height={14}
									style={{ width: 14, height: 14 }}
									className="object-contain"
								/>
								<span className="font-mono">
									{formatNumber(row[field])}
									{field === "perHour" ? "/h" : ""}
								</span>
							</li>
						))}
				</ul>
			))}
		</div>
	);
