import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Research Upgrades",
	description: "Track Laboratory research upgrade progress for your Clash of Clans village.",
	alternates: { canonical: "/upgrade/home/research" },
	openGraph: {
		title: "Research Upgrades | Clash of Clans Tracker",
		description: "Track Laboratory research upgrade progress for your Clash of Clans village.",
		url: "/upgrade/home/research",
	},
};

const ResearchUpgradeLayout = ({ children }: { children: React.ReactNode }) => children;

export default ResearchUpgradeLayout;
