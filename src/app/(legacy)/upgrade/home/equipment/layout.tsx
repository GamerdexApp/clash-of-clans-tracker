import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Hero Equipment Upgrades",
	description: "Track upgrade progress for your Clash of Clans hero equipment.",
	alternates: { canonical: "/upgrade/home/equipment" },
	openGraph: {
		title: "Hero Equipment Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans hero equipment.",
		url: "/upgrade/home/equipment",
	},
};

const EquipmentUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default EquipmentUpgradeLayout;
