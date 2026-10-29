import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mass Edit — Home Village",
	description:
		"Bulk-edit your Clash of Clans home village buildings, troops, and upgrades.",
	alternates: {
		canonical: "/mass-edit/home",
	},
	openGraph: {
		title: "Mass Edit — Home Village | Clash of Clans Tracker",
		description:
			"Bulk-edit your Clash of Clans home village buildings, troops, and upgrades.",
		url: "/mass-edit/home",
	},
};

const MassEditHomeLayout = ({ children }: { children: React.ReactNode }) => children;

export default MassEditHomeLayout;
