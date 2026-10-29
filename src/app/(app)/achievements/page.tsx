import type { Metadata } from "next";

import { AchievementsPage } from "@/comps/achievements/AchievementsPage";

export const metadata: Metadata = {
	title: "Achievements",
	description: "Track the stars, values and rewards of every Clash of Clans achievement across all three villages.",
	alternates: { canonical: "/achievements" },
};

const Page = () => <AchievementsPage />;
export default Page;
