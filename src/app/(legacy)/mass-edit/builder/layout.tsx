import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mass Edit — Builder Base",
	description:
		"Bulk-edit your Clash of Clans Builder Base buildings and upgrades.",
	alternates: {
		canonical: "/mass-edit/builder",
	},
	openGraph: {
		title: "Mass Edit — Builder Base | Clash of Clans Tracker",
		description:
			"Bulk-edit your Clash of Clans Builder Base buildings and upgrades.",
		url: "/mass-edit/builder",
	},
};

const MassEditBuilderLayout = ({ children }: { children: React.ReactNode }) => children;

export default MassEditBuilderLayout;
