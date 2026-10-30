import type { Metadata } from "next";

import { ForgePage } from "@/comps/dailies/ForgePage";

export const metadata: Metadata = {
	title: "Forge, Capital Gold",
	description: "Track the daily Capital Gold, forge slots, Auto Forge and the forge rates for your Town Hall and Builder Hall.",
	alternates: { canonical: "/forge" },
};

const Page = () => <ForgePage />;
export default Page;
