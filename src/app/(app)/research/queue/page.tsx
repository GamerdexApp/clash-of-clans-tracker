import type { Metadata } from "next";

import { QueuePage } from "@/comps/queue/QueuePage";

export const metadata: Metadata = {
	title: "Research queue",
	description: "Plan what the Laboratory researches next, see the timeline and catch order conflicts.",
	alternates: { canonical: "/research/queue" },
};

const Page = () => <QueuePage lane="research" />;
export default Page;
