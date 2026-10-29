import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Guardian Upgrades",
	description: "Track upgrade progress for your Clash of Clans guardians.",
	alternates: { canonical: "/upgrade/home/guardians" },
	openGraph: {
		title: "Guardian Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans guardians.",
		url: "/upgrade/home/guardians",
	},
};

const GuardiansUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default GuardiansUpgradeLayout;
