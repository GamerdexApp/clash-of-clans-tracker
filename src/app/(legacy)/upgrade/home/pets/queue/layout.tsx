import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Pet Queue",
	description: "View your Clash of Clans hero pet upgrade queue.",
	alternates: { canonical: "/upgrade/home/pets/queue" },
	openGraph: {
		title: "Pet Queue | Clash of Clans Tracker",
		description: "View your Clash of Clans hero pet upgrade queue.",
		url: "/upgrade/home/pets/queue",
	},
};

const PetsQueueLayout = ({ children }: { children: React.ReactNode }) => children;

export default PetsQueueLayout;
