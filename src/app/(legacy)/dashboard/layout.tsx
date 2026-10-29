import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Dashboard",
	description:
		"View your Clash of Clans village progress at a glance — Town Hall level, upgrade queue, and account overview.",
	alternates: {
		canonical: "/dashboard",
	},
	openGraph: {
		title: "Dashboard | Clash of Clans Tracker",
		description:
			"View your Clash of Clans village progress at a glance — Town Hall level, upgrade queue, and account overview.",
		url: "/dashboard",
	},
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => children;

export default DashboardLayout;
