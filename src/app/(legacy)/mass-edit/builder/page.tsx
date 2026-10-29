import { redirect } from "next/navigation";

/** The old Builder Base route. Mass edit is one page now, and the tab keeps its name where a category has it. */
const Page = async ({ searchParams }: { searchParams: Promise<{ tab?: string }> }) => {
	const { tab } = await searchParams;
	redirect(`/mass-edit?scope=builder${tab ? `&tab=${encodeURIComponent(tab)}` : ""}`);
};

export default Page;
