import type { Metadata } from "next";

import { VillagesPage } from "@/comps/villages/VillagesPage";

export const metadata: Metadata = {
	title: "My Villages",
	description: "Create, switch, edit and delete your Clash of Clans villages.",
	alternates: { canonical: "/villages" },
};

const Page = () => <VillagesPage />;
export default Page;
