import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Playthroughs",
	description: "View and manage all of your Clash of Clans account playthroughs.",
	alternates: {
		canonical: "/playthrough/list",
	},
	openGraph: {
		title: "Playthroughs | Clash of Clans Tracker",
		description: "View and manage all of your Clash of Clans account playthroughs.",
		url: "/playthrough/list",
	},
};

const PlaythroughListLayout = ({ children }: { children: React.ReactNode }) => children;

export default PlaythroughListLayout;
