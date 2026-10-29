"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreatePlaythroughModal } from "@/comps/modals/CreatePlaythroughModal";

/**
 * /playthrough/new — Immediately opens the CreatePlaythroughModal, then
 * redirects back to the list once closed. This allows linking directly to
 * the "create" flow from nav buttons or the sidebar.
 */
const NewPlaythroughPage = () => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(true);

	useEffect(() => {
		if (!isOpen) {
			router.push("/playthrough/list");
		}
	}, [isOpen, router]);

	return <CreatePlaythroughModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
export default NewPlaythroughPage;
