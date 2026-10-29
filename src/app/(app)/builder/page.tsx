import type { Metadata } from "next";

import { BuilderPage } from "@/comps/builder/BuilderPage";

export const metadata: Metadata = {
	title: "Builder",
	description: "Track Home Village defenses, army buildings, resources, traps, heroes and the Town Hall, with a timer for every upgrade.",
	alternates: { canonical: "/builder" },
};

const Page = () => <BuilderPage />;
export default Page;
