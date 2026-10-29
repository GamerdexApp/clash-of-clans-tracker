"use client";

import type { ReactNode } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { VILLAGES_HREF } from "@/data/nav";
import { ButtonLink } from "@/comps/ui/Button";
import { EmptyState } from "@/comps/ui/EmptyState";
import type { Playthrough } from "@/types/app";
import { PageHeader } from "./PageHeader";

interface VillageGateProps {
	title: string;
	children: (village: Playthrough) => ReactNode;
}

/** The shell already holds the page until storage is read, so the empty panel shows only with no village. */
export const VillageGate = ({ title, children }: VillageGateProps) => {
	const { activePlaythrough } = usePlaythrough();

	if (!activePlaythrough) {
		return (
			<>
				<PageHeader title={title} />
				<EmptyState
					title="No active village"
					description="Choose a village or create one to see this page."
					actions={
						<>
							<ButtonLink href={`${VILLAGES_HREF}?new=1`} variant="primary">
								New village
							</ButtonLink>
							<ButtonLink href={VILLAGES_HREF}>Choose a village</ButtonLink>
						</>
					}
				/>
			</>
		);
	}
	return <>{children(activePlaythrough)}</>;
};
