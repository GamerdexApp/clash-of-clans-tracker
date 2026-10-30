import type { Metadata } from "next";

import { BuilderBaseWallsPage } from "@/comps/builderBase/BuilderBaseWallsPage";

export const metadata: Metadata = {
	title: "Builder Base walls",
	description: "Track how many walls you own on each Builder Base level, price every move and see the cost to reach the top level.",
	alternates: { canonical: "/builder-base/walls" },
};

const Page = () => <BuilderBaseWallsPage />;
export default Page;
