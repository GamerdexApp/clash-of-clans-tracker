import Image from "next/image";
import type { ReactNode } from "react";

import { dailiesText } from "@/lib/messages/dailies";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { helperImage, helperTownHall, type HelperId } from "@/service/helpers";
import { Card } from "@/comps/ui/Card";

const text = dailiesText.helpers;

interface HelperShellProps {
	helper: HelperId;
	townHall: number;
	/** Replaces the subline, such as the Prospector's unlock hint. */
	subline?: string;
	badge?: ReactNode;
	children: ReactNode;
}

/** The header of a helper card. A helper the Town Hall does not reach yet is dimmed and shows only its requirement. */
export const HelperShell = ({ helper, townHall, subline, badge, children }: HelperShellProps) => {
	const required = helperTownHall[helper];
	const open = townHall >= required;
	const name = text.names[helper];

	return (
		<Card dimmed={!open} role="group" aria-label={name} className="flex flex-col gap-4 p-4">
			<div className="flex items-center gap-3">
				<Image
					src={toPublicImageUrl(helperImage[helper])}
					alt=""
					width={48}
					height={48}
					style={{ width: 48, height: 48 }}
					className={`shrink-0 object-contain ${open ? "" : "opacity-60"}`}
				/>
				<div className="flex min-w-0 flex-1 flex-col">
					<h2 className="text-lg font-semibold">{name}</h2>
					<span className="text-muted text-sm">{open ? (subline ?? text.from(required)) : text.lockedCard(required)}</span>
				</div>
				{open && badge}
			</div>
			{open && children}
		</Card>
	);
};
