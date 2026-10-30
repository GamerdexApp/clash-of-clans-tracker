import { redirect } from "next/navigation";

/** The old Home Village route. Mass edit is one page now, and the tab keeps its name where a category has it. */
const Page = async ({ searchParams }: { searchParams: Promise<{ tab?: string }> }) => {
	const { tab } = await searchParams;
	redirect(tab ? `/mass-edit?tab=${encodeURIComponent(tab)}` : "/mass-edit");
};

export default Page;
