import type { Metadata } from "next";

import { LandingPage } from "@/comps/landing/LandingPage";

export const metadata: Metadata = {
	alternates: { canonical: "/" },
};

const Page = () => <LandingPage />;
export default Page;
