import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Wall Upgrades",
	description: "Track upgrade progress for your Clash of Clans home village walls.",
	alternates: { canonical: "/upgrade/home/walls" },
	openGraph: {
		title: "Wall Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans home village walls.",
		url: "/upgrade/home/walls",
	},
};

const WallsUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default WallsUpgradeLayout;
