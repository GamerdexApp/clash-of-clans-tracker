import type { Metadata } from "next";

import { ResearchPage } from "@/comps/research/ResearchPage";

export const metadata: Metadata = {
	title: "Research",
	description: "Track troop, spell and siege machine research with a timer for the Laboratory and the Goblin Researcher.",
	alternates: { canonical: "/research" },
};

const Page = () => <ResearchPage />;
export default Page;
