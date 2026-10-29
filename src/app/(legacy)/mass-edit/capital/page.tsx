import { redirect } from "next/navigation";

/** The old Clan Capital route. Mass edit is one page now. */
const Page = () => redirect("/mass-edit?scope=capital");

export default Page;
