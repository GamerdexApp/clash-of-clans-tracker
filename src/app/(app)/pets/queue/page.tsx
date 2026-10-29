import type { Metadata } from "next";

import { QueuePage } from "@/comps/queue/QueuePage";

export const metadata: Metadata = {
	title: "Pet queue",
	description: "Plan what the Pet House upgrades next, see the timeline and catch order conflicts.",
	alternates: { canonical: "/pets/queue" },
};

const Page = () => <QueuePage lane="pet" />;
export default Page;
