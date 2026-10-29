import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mass Edit — Clan Capital",
	description:
		"Bulk-edit your Clash of Clans Clan Capital districts and upgrades.",
	alternates: {
		canonical: "/mass-edit/capital",
	},
	openGraph: {
		title: "Mass Edit — Clan Capital | Clash of Clans Tracker",
		description:
			"Bulk-edit your Clash of Clans Clan Capital districts and upgrades.",
		url: "/mass-edit/capital",
	},
};

const MassEditCapitalLayout = ({ children }: { children: React.ReactNode }) => children;

export default MassEditCapitalLayout;
