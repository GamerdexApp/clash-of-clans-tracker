import type { Metadata } from "next";

import { DistrictsPage } from "@/comps/capital/DistrictsPage";

export const metadata: Metadata = {
	title: "Clan Capital districts",
	description: "Track your Capital Hall, District Halls, buildings, traps, army and walls across the nine Clan Capital zones.",
	alternates: { canonical: "/clan-capital/districts" },
};

const Page = () => <DistrictsPage />;
export default Page;
