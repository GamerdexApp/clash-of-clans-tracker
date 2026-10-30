"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLock } from "react-icons/lu";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { shellText } from "@/lib/messages/shell";
import { clanCapitalState, lockedRequirement } from "@/service/navAccess";
import { navCounts } from "@/service/navCounts";
import type { NavGroup, NavItem } from "@/data/nav";
import { isNavItemActive, navGroups, settingsNavItem } from "@/data/nav";
import { SectionLabel } from "@/comps/ui/SectionLabel";
import { BrandMark } from "./BrandMark";
import { PlaythroughSwitcher } from "./PlaythroughSwitcher";

interface SidebarLinkProps {
	item: NavItem;
	count?: number;
	locked?: string | null;
	onNavigate?: () => void;
}

const SidebarLink = ({ item, count = 0, locked = null, onNavigate }: SidebarLinkProps) => {
	const active = isNavItemActive(item, usePathname());
	const Icon = item.icon;

	return (
		<Link
			href={item.href}
			onClick={onNavigate}
			aria-current={active ? "page" : undefined}
			className={`flex h-10 items-center gap-2.5 rounded-md px-2.5 lg:h-9 ${
				active
					? "bg-sb-active-bg text-sb-active-text focus-visible:outline-sb-active-text font-semibold"
					: "text-sb-text hover:bg-sb-line"
			} ${locked && !active ? "text-sb-muted" : ""}`}
		>
			<Icon size={16} aria-hidden="true" className="shrink-0" />
			<span className="flex-1">{item.label}</span>
			{locked ? (
				<span className="flex items-center gap-1 text-xs">
					<LuLock size={12} aria-hidden="true" />
					<span aria-hidden="true">{locked}</span>
					<span className="sr-only">{shellText.locked.srLabel(locked)}</span>
				</span>
			) : (
				count > 0 && (
					<span className="bg-sb-active-bg text-sb-active-text min-w-5 rounded-full px-1.5 text-center font-mono text-[11px] font-semibold">
						{count}
					</span>
				)
			)}
		</Link>
	);
};

export const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
	const { activePlaythrough } = usePlaythrough();
	const counts = activePlaythrough ? navCounts(activePlaythrough) : {};

	const clanCapitalOff = activePlaythrough && clanCapitalState(activePlaythrough) === "off";

	const renderGroup = (group: NavGroup) => {
		if (group.id === "clanCapital" && clanCapitalOff) {
			return (
				<SidebarLink
					item={{ ...group.items[0], label: group.label ?? group.items[0].label }}
					locked={shellText.locked.off}
					onNavigate={onNavigate}
				/>
			);
		}
		return group.items.map((item) => (
			<SidebarLink
				key={item.href}
				item={item}
				count={counts[item.id]}
				locked={activePlaythrough ? lockedRequirement(item.id, activePlaythrough) : null}
				onNavigate={onNavigate}
			/>
		));
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4 [--ring:var(--color-sb-ring)]">
			<BrandMark onNavigate={onNavigate} />
			<PlaythroughSwitcher onNavigate={onNavigate} />
			<nav
				aria-label={shellText.mainNav}
				data-focus-inset
				className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
			>
				{navGroups.map((group) => (
					<div key={group.id ?? "top"} className="flex flex-col gap-0.5">
						{group.label && !(group.id === "clanCapital" && clanCapitalOff) && (
							<SectionLabel className="text-sb-muted mt-2 px-2.5 pb-0.5">
								{group.label}
							</SectionLabel>
						)}
						{renderGroup(group)}
					</div>
				))}
			</nav>
			<div data-focus-inset className="border-sb-line border-t-[1.5px] pt-3">
				<SidebarLink item={settingsNavItem} onNavigate={onNavigate} />
			</div>
		</div>
	);
};
