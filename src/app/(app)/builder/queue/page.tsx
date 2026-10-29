import type { Metadata } from "next";

import { QueuePage } from "@/comps/queue/QueuePage";

export const metadata: Metadata = {
	title: "Builder queue",
	description: "Plan what each builder does next, see the timeline and catch order conflicts.",
	alternates: { canonical: "/builder/queue" },
};

const Page = () => <QueuePage lane="builder" />;
export default Page;
