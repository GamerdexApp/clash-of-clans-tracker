import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "New Playthrough",
	description: "Start tracking a new Clash of Clans account playthrough.",
	alternates: {
		canonical: "/playthrough/new",
	},
	openGraph: {
		title: "New Playthrough | Clash of Clans Tracker",
		description: "Start tracking a new Clash of Clans account playthrough.",
		url: "/playthrough/new",
	},
};

const PlaythroughNewLayout = ({ children }: { children: React.ReactNode }) => children;

export default PlaythroughNewLayout;
