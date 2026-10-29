import Link from "next/link";

import { upgradeText } from "@/lib/messages/upgrades";

const massEditHref = (scope: "home" | "builder", tab?: string) => {
	const params = new URLSearchParams(scope === "home" ? {} : { scope });
	if (tab) params.set("tab", tab);
	const query = params.toString();
	return query ? `/mass-edit?${query}` : "/mass-edit";
};

/** A line that points to Mass edit. The tab names the scope Mass edit opens on. */
export const MassEditLink = ({
	hint = upgradeText.massEdit.hint,
	scope = "home",
	tab,
}: {
	hint?: string;
	scope?: "home" | "builder";
	tab?: string;
}) => (
	<p className="text-muted">
		{hint}{" "}
		<Link
			href={massEditHref(scope, tab)}
			className="text-link font-medium underline"
		>
			{upgradeText.massEdit.link}
		</Link>
	</p>
);
