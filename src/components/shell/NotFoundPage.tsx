"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { shellText } from "@/lib/messages/shell";
import { closestPath } from "@/lib/utils/suggestPath";
import { allNavItems, HOME_HREF, navGroups, settingsNavItem, VILLAGES_HREF } from "@/data/nav";
import { ButtonLink } from "@/comps/ui/Button";
import { AppShell } from "./AppShell";

const text = shellText.notFound;

/** One chip per group, named for the group, plus the pages that sit outside the groups. */
const jumpChips = [
	...navGroups.flatMap((group) =>
		group.label
			? [{ id: group.id ?? group.label, label: group.label, href: group.items[0].href }]
			: group.items.map((item) => ({ id: item.id, label: item.label, href: item.href }))
	),
	{ id: settingsNavItem.id, label: settingsNavItem.label, href: settingsNavItem.href },
];

export const NotFoundPage = () => {
	const { activePlaythrough } = usePlaythrough();
	const pathname = usePathname();
	const suggestion = closestPath(
		pathname,
		allNavItems.map((item) => item.href)
	);
	const suggested = allNavItems.find((item) => item.href === suggestion);

	return (
		<AppShell>
			<div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
				<p className="font-brand text-primary text-8xl leading-none">404</p>
				<h1 className="text-2xl font-semibold">{text.title}</h1>
				<p className="text-muted max-w-md">{text.body}</p>
				<code className="bg-tint rounded-md px-2 py-1 font-mono text-sm break-all">
					{pathname}
				</code>
				{suggested && (
					<p>
						{text.didYouMean}{" "}
						<Link href={suggested.href} className="text-link font-medium underline">
							{suggested.label}
						</Link>
						?
					</p>
				)}
				<div className="mt-4 flex flex-wrap justify-center gap-3">
					{activePlaythrough ? (
						<ButtonLink href="/overview" variant="primary">
							{text.toOverview}
						</ButtonLink>
					) : (
						<ButtonLink href={VILLAGES_HREF} variant="primary">
							{text.toVillages}
						</ButtonLink>
					)}
					<ButtonLink href={HOME_HREF}>{text.toHome}</ButtonLink>
				</div>
				{!activePlaythrough && (
					<p className="text-muted max-w-md text-sm">{text.noVillage}</p>
				)}
				<nav aria-label={text.jumpTo} className="mt-2 flex flex-col items-center gap-2">
					<span className="text-muted text-sm">{text.jumpTo}</span>
					<ul className="flex flex-wrap justify-center gap-2">
						{jumpChips.map((item) => (
							<li key={item.id}>
								<Link
									href={item.href}
									className="border-line bg-surface hover:bg-tint flex min-h-9 items-center rounded-full border-[1.5px] px-3 text-sm"
								>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</div>
		</AppShell>
	);
};
