import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Forge",
	description:
		"Plan and track your Clash of Clans hero equipment forging progress.",
	alternates: {
		canonical: "/forge",
	},
	openGraph: {
		title: "Forge | Clash of Clans Tracker",
		description:
			"Plan and track your Clash of Clans hero equipment forging progress.",
		url: "/forge",
	},
};

const ForgeLayout = ({ children }: { children: React.ReactNode }) => children;

export default ForgeLayout;
