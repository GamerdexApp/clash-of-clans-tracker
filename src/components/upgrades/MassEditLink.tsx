import Link from "next/link";

import { upgradeText } from "@/lib/messages/upgrades";

/** A line that points to Mass edit. The tab names the scope Mass edit opens on. */
export const MassEditLink = ({ hint = upgradeText.massEdit.hint, tab }: { hint?: string; tab?: string }) => (
	<p className="text-muted">
		{hint}{" "}
		<Link
			href={tab ? `/mass-edit/home?tab=${tab}` : "/mass-edit/home"}
			className="text-link font-medium underline"
		>
			{upgradeText.massEdit.link}
		</Link>
	</p>
);
