import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Hero Upgrades",
	description: "Track upgrade progress for your Clash of Clans heroes.",
	alternates: { canonical: "/upgrade/home/heroes" },
	openGraph: {
		title: "Hero Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans heroes.",
		url: "/upgrade/home/heroes",
	},
};

const HeroesUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default HeroesUpgradeLayout;
