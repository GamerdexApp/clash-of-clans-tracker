"use client";

import Image from "next/image";
import { useState } from "react";
import { RESOURCE_ICONS } from "@/lib/constants/leagueIcons";
import { formatNumber } from "@/lib/format";
import { overviewText } from "@/lib/messages/overview";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { LeagueInfo } from "@/service/leagues";
import { Dialog } from "@/comps/ui/Dialog";

const text = overviewText.league;

const Line = ({ label, value, icon }: { label: string; value: number; icon: string }) => (
	<li className="flex items-center justify-between gap-3">
		<span className="flex items-center gap-1.5">
			<Image
				src={toPublicImageUrl(icon)}
				alt=""
				width={16}
				height={16}
				style={{ width: 16, height: 16 }}
				className="object-contain"
			/>
			{label}
		</span>
		<span className="font-mono">{formatNumber(value)}</span>
	</li>
);

/** The league icon and name. Pressing it opens the rewards of that league. */
export const LeagueButton = ({ league }: { league: LeagueInfo }) => {
	const [open, setOpen] = useState(false);
	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label={text.open(league.name)}
				className="hover:bg-tint flex min-h-11 flex-col items-center gap-0.5 rounded-md px-2 py-1"
			>
				<span className="relative size-10">
					<Image
						src={toPublicImageUrl(league.image)}
						alt=""
						fill
						sizes="40px"
						className="object-contain"
					/>
				</span>
				<span className="text-center text-xs leading-tight font-medium">{league.name}</span>
			</button>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				title={league.name}
				description={league.kind === "home" ? text.homeKind : text.builderKind}
			>
				<div className="flex flex-col gap-4">
					{league.noData && <p className="text-muted">{text.noData}</p>}
					{league.stats.length > 0 && (
						<dl className="flex flex-col gap-1.5">
							{league.stats.map((stat) => (
								<div key={stat.label} className="flex justify-between gap-3">
									<dt className="text-muted">{stat.label}</dt>
									<dd className="font-mono">{stat.value}</dd>
								</div>
							))}
						</dl>
					)}
					{league.sections.map((section) => (
						<section key={section.title} className="flex flex-col gap-1.5">
							<h3 className="font-semibold">{section.title}</h3>
							<ul className="flex flex-col gap-1.5">
								{section.lines.map((line) => (
									<Line
										key={`${section.title}-${line.label}`}
										label={line.label}
										value={line.value}
										icon={RESOURCE_ICONS[line.icon]}
									/>
								))}
							</ul>
						</section>
					))}
					{league.battle.length > 0 && (
						<section className="flex flex-col gap-1.5">
							<h3 className="font-semibold">{text.battle}</h3>
							<table className="w-full text-sm">
								<thead>
									<tr className="text-muted text-start">
										<th scope="col" className="py-1 text-start font-medium">
											{text.stars}
										</th>
										<th scope="col" className="py-1 text-end font-medium">
											{text.attacker}
										</th>
										<th scope="col" className="py-1 text-end font-medium">
											{text.defender}
										</th>
									</tr>
								</thead>
								<tbody>
									{league.battle.map((row) => (
										<tr
											key={row.stars}
											className="border-line border-t-[1.5px]"
										>
											<th scope="row" className="py-1 text-start font-medium">
												{row.stars}
											</th>
											<td className="py-1 text-end font-mono">
												{formatNumber(row.attacker)}
											</td>
											<td className="py-1 text-end font-mono">
												{formatNumber(row.defender)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</section>
					)}
				</div>
			</Dialog>
		</>
	);
};
