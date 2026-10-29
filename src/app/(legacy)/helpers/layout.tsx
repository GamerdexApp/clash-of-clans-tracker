import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Helpers",
	description:
		"Useful Clash of Clans calculators and helper tools to plan your upgrades.",
	alternates: {
		canonical: "/helpers",
	},
	openGraph: {
		title: "Helpers | Clash of Clans Tracker",
		description:
			"Useful Clash of Clans calculators and helper tools to plan your upgrades.",
		url: "/helpers",
	},
};

const HelpersLayout = ({ children }: { children: React.ReactNode }) => children;

export default HelpersLayout;
