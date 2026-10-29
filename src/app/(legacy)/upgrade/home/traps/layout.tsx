import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Trap Upgrades",
	description: "Track upgrade progress for your Clash of Clans home village traps.",
	alternates: { canonical: "/upgrade/home/traps" },
	openGraph: {
		title: "Trap Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans home village traps.",
		url: "/upgrade/home/traps",
	},
};

const TrapsUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default TrapsUpgradeLayout;
