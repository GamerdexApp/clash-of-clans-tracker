import type { Metadata } from "next";

import { BuilderQueuePage } from "@/comps/builder/queue/BuilderQueuePage";

export const metadata: Metadata = {
	title: "Builder queue",
	description: "Plan what each builder does next, see the timeline and catch order conflicts.",
	alternates: { canonical: "/builder/queue" },
};

const Page = () => <BuilderQueuePage />;
export default Page;
