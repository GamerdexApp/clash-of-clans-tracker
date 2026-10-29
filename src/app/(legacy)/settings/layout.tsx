import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Settings",
	description: "Manage your Clash of Clans Tracker account and preferences.",
	alternates: {
		canonical: "/settings",
	},
	robots: {
		index: false,
		follow: true,
	},
};

const SettingsLayout = ({ children }: { children: React.ReactNode }) => children;

export default SettingsLayout;
