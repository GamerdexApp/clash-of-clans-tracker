import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Builder Queue",
	description: "View your Clash of Clans home village builder upgrade queue.",
	alternates: { canonical: "/upgrade/home/builder/queue" },
	openGraph: {
		title: "Builder Queue | Clash of Clans Tracker",
		description: "View your Clash of Clans home village builder upgrade queue.",
		url: "/upgrade/home/builder/queue",
	},
};

const BuilderQueueLayout = ({ children }: { children: React.ReactNode }) => children;

export default BuilderQueueLayout;
