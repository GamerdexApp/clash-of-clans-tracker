import type { Metadata } from "next";

import { OverviewPage } from "@/comps/overview/OverviewPage";

export const metadata: Metadata = {
	title: "Overview",
	description: "See your Clash of Clans village at a glance: progress, daily timers, Gold Pass perks and every stored stat.",
	alternates: { canonical: "/overview" },
};

const Page = () => <OverviewPage />;
export default Page;
