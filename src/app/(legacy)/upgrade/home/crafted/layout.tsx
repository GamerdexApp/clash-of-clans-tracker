import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Crafted Defenses",
	description: "Track upgrade progress for your Clash of Clans crafted defenses.",
	alternates: { canonical: "/upgrade/home/crafted" },
	openGraph: {
		title: "Crafted Defenses | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans crafted defenses.",
		url: "/upgrade/home/crafted",
	},
};

const CraftedUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default CraftedUpgradeLayout;
