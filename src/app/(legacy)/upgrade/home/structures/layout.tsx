import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Structure Upgrades",
	description: "Track upgrade progress for your Clash of Clans home village structures.",
	alternates: { canonical: "/upgrade/home/structures" },
	openGraph: {
		title: "Structure Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans home village structures.",
		url: "/upgrade/home/structures",
	},
};

const StructuresUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default StructuresUpgradeLayout;
