import type { Metadata } from "next";

import { BuilderBaseUpgradesPage } from "@/comps/builderBase/BuilderBaseUpgradesPage";

export const metadata: Metadata = {
	title: "Builder Base upgrades",
	description: "Track Builder Base buildings, heroes and the Clock Tower, with a timer for each of the two builders.",
	alternates: { canonical: "/builder-base/upgrades" },
};

const Page = () => <BuilderBaseUpgradesPage />;
export default Page;
