import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Builder Upgrades",
	description: "Track upgrade progress for your Clash of Clans home village builders.",
	alternates: { canonical: "/upgrade/home/builder" },
	openGraph: {
		title: "Builder Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans home village builders.",
		url: "/upgrade/home/builder",
	},
};

const BuilderUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default BuilderUpgradeLayout;
