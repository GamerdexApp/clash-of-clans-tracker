import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Pet Upgrades",
	description: "Track upgrade progress for your Clash of Clans hero pets.",
	alternates: { canonical: "/upgrade/home/pets" },
	openGraph: {
		title: "Pet Upgrades | Clash of Clans Tracker",
		description: "Track upgrade progress for your Clash of Clans hero pets.",
		url: "/upgrade/home/pets",
	},
};

const PetsUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default PetsUpgradeLayout;
