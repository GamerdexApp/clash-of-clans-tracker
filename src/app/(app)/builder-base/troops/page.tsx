import type { Metadata } from "next";

import { BuilderBaseTroopsPage } from "@/comps/builderBase/BuilderBaseTroopsPage";

export const metadata: Metadata = {
	title: "Builder Base troops",
	description: "Track Builder Base troop levels with a timer for the Star Laboratory.",
	alternates: { canonical: "/builder-base/troops" },
};

const Page = () => <BuilderBaseTroopsPage />;
export default Page;
