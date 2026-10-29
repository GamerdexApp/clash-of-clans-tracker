import type { Metadata } from "next";

import { CapitalTroopsPage } from "@/comps/capital/CapitalTroopsPage";

export const metadata: Metadata = {
	title: "Clan Capital troops and spells",
	description: "Track the levels of your 17 Clan Capital troops and 7 spells, locked until their District Hall opens.",
	alternates: { canonical: "/clan-capital/troops" },
};

const Page = () => <CapitalTroopsPage />;
export default Page;
