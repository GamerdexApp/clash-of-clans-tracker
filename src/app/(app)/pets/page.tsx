import type { Metadata } from "next";

import { PetsPage } from "@/comps/pets/PetsPage";

export const metadata: Metadata = {
	title: "Pets",
	description: "Track pet levels with a timer for the Pet House.",
	alternates: { canonical: "/pets" },
};

const Page = () => <PetsPage />;
export default Page;
