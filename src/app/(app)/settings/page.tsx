import type { Metadata } from "next";

import { SettingsPage } from "@/comps/settings/SettingsPage";

export const metadata: Metadata = {
	title: "Settings",
	description:
		"Export, import or reset your Clash of Clans Tracker data, set your active hours and choose a theme.",
	alternates: { canonical: "/settings" },
};

const Page = () => <SettingsPage />;
export default Page;
