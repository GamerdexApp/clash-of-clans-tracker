import type { Metadata } from "next";
import { Suspense } from "react";

import { MassEditPage } from "@/comps/massEdit/MassEditPage";

export const metadata: Metadata = {
	title: "Mass edit",
	description: "Stage many level changes at once for your Home Village, then save them together.",
	alternates: { canonical: "/mass-edit" },
};

const Page = () => (
	<Suspense>
		<MassEditPage />
	</Suspense>
);
export default Page;
