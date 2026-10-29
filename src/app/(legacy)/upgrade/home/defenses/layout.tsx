import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Defense Upgrades",
	description: "Track upgrade progress for your Clash of Clans home village defenses.",
	alternates: { canonical: "/upgrade/home/defenses" },
	openGraph: {
		title: "Defense Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans home village defenses.",
		url: "/upgrade/home/defenses",
	},
};

const DefensesUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default DefensesUpgradeLayout;
