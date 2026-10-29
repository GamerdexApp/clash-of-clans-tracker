import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Season Pass",
	description:
		"Track your Clash of Clans Gold Pass and season progress.",
	alternates: {
		canonical: "/season-pass",
	},
	openGraph: {
		title: "Season Pass | Clash of Clans Tracker",
		description: "Track your Clash of Clans Gold Pass and season progress.",
		url: "/season-pass",
	},
};

const SeasonPassLayout = ({ children }: { children: React.ReactNode }) => children;

export default SeasonPassLayout;
