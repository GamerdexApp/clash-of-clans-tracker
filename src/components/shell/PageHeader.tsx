import type { ReactNode } from "react";

import { SavedChip } from "@/comps/ui/SavedChip";
import { SyncChip } from "./SyncChip";

interface PageHeaderProps {
	title: string;
	subline?: string;
	actions?: ReactNode;
}

export const PageHeader = ({ title, subline, actions }: PageHeaderProps) => (
	<header className="flex flex-wrap items-center justify-between gap-4">
		<div className="flex flex-col">
			<h1 className="text-2xl font-semibold max-lg:sr-only">{title}</h1>
			{subline && <span className="text-muted max-lg:sr-only">{subline}</span>}
		</div>
		<div className="flex flex-wrap items-center gap-3">
			{actions}
			<span className="flex items-center gap-3 max-lg:hidden">
				<SavedChip />
				<SyncChip />
			</span>
		</div>
	</header>
);
