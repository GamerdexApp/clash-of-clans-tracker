import type { Metadata } from "next";

import { SeasonPassPage } from "@/comps/dailies/SeasonPassPage";

export const metadata: Metadata = {
	title: "Season Pass",
	description: "Set the Gold Pass builder and research boosts and track the Gold Pass perks for the month.",
	alternates: { canonical: "/season-pass" },
};

const Page = () => <SeasonPassPage />;
export default Page;
