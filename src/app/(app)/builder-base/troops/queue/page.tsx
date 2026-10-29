import type { Metadata } from "next";

import { QueuePage } from "@/comps/queue/QueuePage";

export const metadata: Metadata = {
	title: "Star Laboratory queue",
	description: "Plan what the Star Laboratory researches next, see the timeline and catch order conflicts.",
	alternates: { canonical: "/builder-base/troops/queue" },
};

const Page = () => <QueuePage lane="bbResearch" />;
export default Page;
