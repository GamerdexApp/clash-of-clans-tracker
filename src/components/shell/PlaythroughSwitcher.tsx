"use client";

import Image from "next/image";
import { useState } from "react";
import type { ButtonHTMLAttributes } from "react";
import { LuChevronDown, LuPlus } from "react-icons/lu";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useIsDesktop } from "@/lib/hooks/useMediaQuery";
import { shellText } from "@/lib/messages/shell";
import { VILLAGES_HREF } from "@/data/nav";
import { Dialog } from "@/comps/ui/Dialog";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/comps/ui/Menu";
import { SectionLabel } from "@/comps/ui/SectionLabel";
import { TownHallIcon } from "./TownHallIcon";
import type { Playthrough } from "@/types/app";

const text = shellText.switcher;
const NEW_VILLAGE_HREF = `${VILLAGES_HREF}?new=1`;

const hallLine = (village: Playthrough) =>
	text.halls(village.data.homeVillage.townHallLevel, village.data.builderBase.builderHallLevel);

interface ChoicesProps {
	inMenu: boolean;
	close: () => void;
	onNavigate?: () => void;
}

const VillageChoices = ({ inMenu, close, onNavigate }: ChoicesProps) => {
	const { playthroughs, activePlaythrough, setActivePlaythrough } = usePlaythrough();
	const role = inMenu ? "menuitem" : "button";
	const followLink = () => {
		close();
		onNavigate?.();
	};

	return (
		<>
			{playthroughs.length > 0 && (
				<>
					{inMenu && <MenuLabel>{text.villages}</MenuLabel>}
					{playthroughs.map((village) => {
						const isActive = village.id === activePlaythrough?.id;
						return (
							<MenuItem
								key={village.id}
								role={role}
								active={isActive}
								className="justify-between gap-2"
								onSelect={() => {
									setActivePlaythrough(village.id);
									close();
								}}
							>
								<span className="flex min-w-0 items-center gap-2.5">
									<TownHallIcon level={village.data.homeVillage.townHallLevel} size={28} />
									<span className="flex min-w-0 flex-col">
										<span className="truncate font-medium">{village.name}</span>
										<span className="text-muted truncate text-xs">{hallLine(village)}</span>
									</span>
								</span>
								{isActive && (
									<span className="text-primary font-mono text-xs font-medium">
										{text.active}
									</span>
								)}
							</MenuItem>
						);
					})}
					<MenuSeparator />
				</>
			)}
			<MenuItem role={role} href={VILLAGES_HREF} onSelect={followLink} className="gap-2 font-medium">
				{text.all}
			</MenuItem>
			<MenuItem
				role={role}
				href={NEW_VILLAGE_HREF}
				onSelect={followLink}
				className="text-primary gap-2.5 font-semibold"
			>
				<LuPlus size={16} aria-hidden="true" />
				{text.create}
			</MenuItem>
		</>
	);
};

export const PlaythroughSwitcher = ({ onNavigate }: { onNavigate?: () => void }) => {
	const { activePlaythrough, isLoaded } = usePlaythrough();
	const isDesktop = useIsDesktop();
	const [sheetOpen, setSheetOpen] = useState(false);

	const triggerName = !isLoaded ? text.loading : (activePlaythrough?.name ?? text.none);
	const triggerDetail = activePlaythrough
		? hallLine(activePlaythrough)
		: isLoaded
			? text.noneDetail
			: "";

	const renderTrigger = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button
			type="button"
			disabled={!isLoaded}
			{...props}
			className="border-sb-line text-sb-text flex h-12 w-full items-center justify-between gap-2 rounded-md border-[1.5px] px-3 text-start"
		>
			<span className="flex min-w-0 items-center gap-2.5">
				<span
					aria-hidden="true"
					className="bg-sb-line flex size-8 shrink-0 items-center justify-center overflow-hidden rounded"
				>
					{activePlaythrough ? (
						<TownHallIcon level={activePlaythrough.data.homeVillage.townHallLevel} size={32} />
					) : (
						<Image src="/clash-of-clans-icon.png" alt="" width={32} height={32} className="size-8 object-contain" />
					)}
				</span>
				<span className="flex min-w-0 flex-col">
					<span className="truncate font-medium">{triggerName}</span>
					{triggerDetail && (
						<span className="text-sb-muted truncate text-xs">{triggerDetail}</span>
					)}
				</span>
			</span>
			<LuChevronDown size={14} aria-hidden="true" className="text-sb-muted shrink-0" />
		</button>
	);

	return (
		<div className="flex flex-col gap-1.5">
			<SectionLabel className="text-sb-muted">{text.sectionLabel}</SectionLabel>
			{isDesktop ? (
				<Menu label={text.switch} trigger={({ props }) => renderTrigger(props)}>
					{(close) => <VillageChoices inMenu close={close} onNavigate={onNavigate} />}
				</Menu>
			) : (
				<>
					{renderTrigger({
						"aria-haspopup": "dialog",
						onClick: () => setSheetOpen(true),
					})}
					<Dialog open={sheetOpen} onClose={() => setSheetOpen(false)} title={text.switch}>
						<div className="-mx-2 flex flex-col gap-0.5">
							<VillageChoices
								inMenu={false}
								close={() => setSheetOpen(false)}
								onNavigate={onNavigate}
							/>
						</div>
					</Dialog>
				</>
			)}
		</div>
	);
};
