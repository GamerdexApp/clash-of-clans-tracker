import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Research Queue",
	description: "View your Clash of Clans Laboratory research queue.",
	alternates: { canonical: "/upgrade/home/research/queue" },
	openGraph: {
		title: "Research Queue | Clash of Clans Tracker",
		description: "View your Clash of Clans Laboratory research queue.",
		url: "/upgrade/home/research/queue",
	},
};

const ResearchQueueLayout = ({ children }: { children: React.ReactNode }) => children;

export default ResearchQueueLayout;
