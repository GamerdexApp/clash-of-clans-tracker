import Link from "next/link";

import { upgradeText } from "@/lib/messages/upgrades";

/** Builder Base keeps its own page until Mass edit takes it over. */
const massEditHref = (scope: "home" | "builder", tab?: string) => {
	const base = scope === "home" ? "/mass-edit" : "/mass-edit/builder";
	return tab ? `${base}?tab=${tab}` : base;
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
