import Link from "next/link";
import type { ReactNode } from "react";
import { overviewText } from "@/lib/messages/overview";
import { Card } from "@/comps/ui/Card";

interface ItemGroupProps {
	title: string;
	href: string;
	children: ReactNode;
	/** Lays the children out as a two column grid of cards instead of a wrapping row of icons. */
	grid?: boolean;
}

/** A titled card of icons with a link to the page that edits them. */
export const ItemGroup = ({ title, href, children, grid = false }: ItemGroupProps) => (
	<Card className="flex flex-col gap-3 p-4">
		<div className="flex items-center justify-between gap-3">
			<h3 className="font-semibold">{title}</h3>
			<Link href={href} className="text-link text-sm font-medium underline">
				{overviewText.home.queue}
			</Link>
		</div>
		<div className={grid ? "grid gap-3 sm:grid-cols-2" : "flex flex-wrap gap-1.5"}>
			{children}
		</div>
	</Card>
);
