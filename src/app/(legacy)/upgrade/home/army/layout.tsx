import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Army Upgrades",
	description: "Track upgrade progress for your Clash of Clans home village army camp and troops.",
	alternates: { canonical: "/upgrade/home/army" },
	openGraph: {
		title: "Army Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans home village army camp and troops.",
		url: "/upgrade/home/army",
	},
};

const ArmyUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default ArmyUpgradeLayout;
