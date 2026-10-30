import type { Metadata } from "next";

import { EquipmentPage } from "@/comps/equipment/EquipmentPage";

export const metadata: Metadata = {
	title: "Equipment",
	description: "Track hero equipment levels, the ore each level costs and the ore you hold.",
	alternates: { canonical: "/equipment" },
};

const Page = () => <EquipmentPage />;
export default Page;
