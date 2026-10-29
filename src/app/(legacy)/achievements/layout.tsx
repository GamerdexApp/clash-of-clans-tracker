import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Achievements",
	description:
		"Track your Clash of Clans achievement progress and see what's left to complete.",
	alternates: {
		canonical: "/achievements",
	},
	openGraph: {
		title: "Achievements | Clash of Clans Tracker",
		description:
			"Track your Clash of Clans achievement progress and see what's left to complete.",
		url: "/achievements",
	},
};

const AchievementsLayout = ({ children }: { children: React.ReactNode }) => children;

export default AchievementsLayout;
