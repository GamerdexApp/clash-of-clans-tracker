import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Resource Building Upgrades",
	description: "Track upgrade progress for your Clash of Clans resource buildings.",
	alternates: { canonical: "/upgrade/home/resources" },
	openGraph: {
		title: "Resource Building Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans resource buildings.",
		url: "/upgrade/home/resources",
	},
};

const ResourcesUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default ResourcesUpgradeLayout;
