import type { Metadata } from "next";

import { WallsPage } from "@/comps/walls/WallsPage";

export const metadata: Metadata = {
	title: "Walls",
	description: "Track how many walls you own on each level, price every move and see the cost to reach the top level.",
	alternates: { canonical: "/walls" },
};

const Page = () => <WallsPage />;
export default Page;
