import type { Metadata } from "next";

import { QueuePage } from "@/comps/queue/QueuePage";

export const metadata: Metadata = {
	title: "Builder Base queue",
	description: "Plan what each Builder Base builder upgrades next, see the timeline and catch order conflicts.",
	alternates: { canonical: "/builder-base/queue" },
};

const Page = () => <QueuePage lane="bbBuilder" />;
export default Page;
