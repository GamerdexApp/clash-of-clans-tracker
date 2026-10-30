import type { Metadata } from "next";

import { HelpersPage } from "@/comps/dailies/HelpersPage";

export const metadata: Metadata = {
	title: "Helpers",
	description: "Track the Builder's Apprentice, Lab Assistant, Alchemist and Prospector with daily timers, levels and assignments.",
	alternates: { canonical: "/helpers" },
};

const Page = () => <HelpersPage />;
export default Page;
