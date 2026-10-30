"use client";

import type { ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";
import { useMemoryState } from "@/lib/hooks/useMemoryState";
import { Card } from "@/comps/ui/Card";

interface SectionProps {
	title: string;
	/** A count next to the title, such as "41 / 50". */
	badge?: string;
	/** What the section lets the player do, under the title. */
	description?: string;
	children: ReactNode;
}

/**
 * A titled card of a page. The heading is a button that closes and opens the section, and
 * the choice is remembered while the app stays open. A closed section keeps its badge.
 */
export function Section({ title, badge, description, children }: SectionProps) {
	const slug = title.replace(/\W+/g, "-").toLowerCase();
	const headingId = `section-${slug}`;
	const bodyId = `section-${slug}-body`;
	const [collapsed, setCollapsed] = useMemoryState(`section:collapsed:${slug}`, false);

	return (
		<Card aria-labelledby={headingId} role="region" className="flex flex-col gap-3 p-4">
			<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
				<h2 id={headingId} className="min-w-0 flex-1 text-lg font-semibold">
					<button
						type="button"
						aria-expanded={!collapsed}
						aria-controls={bodyId}
						onClick={() => setCollapsed(!collapsed)}
						className="hover:bg-tint -ms-2 flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-start lg:min-h-9"
					>
						<LuChevronDown
							aria-hidden="true"
							size={18}
							className={`text-muted shrink-0 transition-transform ${collapsed ? "-rotate-90 rtl:rotate-90" : ""}`}
						/>
						{title}
					</button>
				</h2>
				{badge && (
					<span className="border-line rounded-full border-[1.5px] px-2.5 py-0.5 font-mono text-xs whitespace-nowrap">
						{badge}
					</span>
				)}
			</div>
			<div id={bodyId} hidden={collapsed} className="flex flex-col gap-3">
				{description && <p className="text-muted text-sm">{description}</p>}
				{children}
			</div>
		</Card>
	);
}
